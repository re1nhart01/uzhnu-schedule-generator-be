from django.urls import path

from authentication.views import AuthenticateWithGoogleView, GoogleCallbackView, WhoamiView


urlpatterns = [
    path("google/callback", GoogleCallbackView.as_view(), name="google_callback"),
    path("google/get-redirect-uri/", AuthenticateWithGoogleView.as_view(), name="google_get_redirect_uri"),
    path("whoami/", WhoamiView.as_view(), name="whoami"),
]