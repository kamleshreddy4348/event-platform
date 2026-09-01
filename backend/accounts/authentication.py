from django.conf import settings
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed


class ExpiringTokenAuthentication(TokenAuthentication):
    """
    Same as DRF's TokenAuthentication, but tokens expire after
    settings.TOKEN_EXPIRE_HOURS hours from creation (i.e. from login).
    An expired token is deleted so the user has to log in again to get a new one.
    """

    def authenticate_credentials(self, key):
        try:
            token = Token.objects.select_related('user').get(key=key)
        except Token.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')

        if not token.user.is_active:
            raise AuthenticationFailed('User is inactive.')

        expire_hours = getattr(settings, 'TOKEN_EXPIRE_HOURS', 24)
        if timezone.now() > token.created + timezone.timedelta(hours=expire_hours):
            token.delete()
            raise AuthenticationFailed('Session expired. Please log in again.')

        return token.user, token
