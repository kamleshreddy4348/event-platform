from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()
token_generator = PasswordResetTokenGenerator()


def token_expiry_payload(token):
    expire_hours = getattr(settings, 'TOKEN_EXPIRE_HOURS', 24)
    expires_at = token.created + timezone.timedelta(hours=expire_hours)
    return {'expires_at': expires_at.isoformat()}


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {'token': token.key, 'user': UserSerializer(user).data, **token_expiry_payload(token)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
        )
        if user is None:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        # Issue a fresh token so its expiry clock starts from this login,
        # rather than reusing a token created hours/days ago.
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data, **token_expiry_payload(token)})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = UserSerializer(request.user).data
        token = getattr(request.user, 'auth_token', None)
        if token:
            data.update(token_expiry_payload(token))
        return Response(data)


class PasswordResetRequestView(APIView):
    """
    Generates a uid/token pair for resetting a password and emails a reset
    link built from FRONTEND_URL.

    In dev mode (no EMAIL_HOST configured), emails print to the console, and
    the uid/token are also returned directly in the response so the frontend
    flow can be tested end-to-end without needing to read server logs. In
    production (EMAIL_HOST set), only "check your email" is returned — the
    uid/token are never exposed via the API response.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        generic_response = {'detail': 'If that email exists, a reset link has been sent.'}
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't leak which emails exist
            return Response(generic_response)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        reset_link = f'{settings.FRONTEND_URL}/password-reset?uid={uid}&token={token}'

        send_mail(
            subject='Reset your EventHub password',
            message=(
                f'Hi {user.username},\n\n'
                f'Someone requested a password reset for your EventHub account. '
                f'Click the link below to choose a new password:\n\n{reset_link}\n\n'
                f"If you didn't request this, you can safely ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )

        if getattr(settings, 'EMAIL_SENDING_ENABLED', False):
            # Real SMTP is configured — never hand the token back over the API.
            return Response(generic_response)

        # Dev mode: no real email server, so hand back uid/token directly too.
        return Response({**generic_response, 'uid': uid, 'token': token})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            uid = force_str(urlsafe_base64_decode(data['uid']))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, data['token']):
            return Response({'detail': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data['new_password'])
        user.save()
        Token.objects.filter(user=user).delete()
        return Response({'detail': 'Password has been reset successfully.'})
