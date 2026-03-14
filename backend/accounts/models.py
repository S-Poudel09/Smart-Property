from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    )

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "full_name"]

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="accounts_users",
        blank=True,
    )

    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="accounts_users_permissions",
        blank=True,
    )

    def __str__(self):
        return self.email