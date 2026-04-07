"""
Application configuration for the accounts app.

This file defines the Django application settings for the accounts module.
It allows Django to recognize and load the app as part of the overall
project configuration.
"""
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = "accounts"
