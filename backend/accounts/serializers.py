from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Controls what a "user" looks like when sent back as JSON.
    Notably: never includes the password.
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles creating a new user. Takes username/email/password/role in,
    validates the password against Django's built-in strength rules,
    and hashes it before saving (never stores plain text passwords).
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            role=validated_data.get("role", User.Role.ATTENDEE),
        )
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Step 1 of password reset: person submits their email. We don't reveal
    whether that email exists or not (that would leak who has an account),
    so this always "succeeds" from the outside.
    """

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Step 2 of password reset: person submits the uid + token they got
    (via email in a real app; via the console log in our dev setup),
    plus their chosen new password.
    """

    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
