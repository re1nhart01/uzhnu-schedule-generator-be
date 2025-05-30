from django.http import HttpResponseRedirect
from common.services.google import GoogleService
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
import dotenv
from django.contrib.auth import login
import os

dotenv.load_dotenv()

@extend_schema(auth=[], responses={200: dict})
class AuthenticateWithGoogleView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]
    """
    View to handle Google login.
    """

    def get(self, request):
        google_service = GoogleService()
        auth_type = request.query_params.get("auth_type", "sign-in")
        if auth_type not in ["sign-in", "sign-up"]:
            return Response({"error": "Invalid auth_type"}, status=400)
        auth_url: dict = google_service.retrieve_auth_uri(auth_type)
        return Response(auth_url, status=200)

@extend_schema(auth=[])
class GoogleCallbackView(APIView):
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def get(self, request):
        auth_provider = GoogleService()
        code = request.query_params.get("code")
        auth_type = request.query_params.get("state")
        if not code:
            return Response({"error": "Missing code"}, status=400)
        if not auth_type:
            return Response({"error": "Missing auth_type"}, status=400)
        user_info = auth_provider.retrieve_user_info(code)
        user = get_user_model().objects.filter(email=user_info["email"]).first()
        if not user:
            user = get_user_model().objects.create(
                email=user_info["email"],
                first_name=user_info["given_name"],
                last_name=user_info["family_name"],
                image_url=user_info["picture"],
                role="student" if "student" in user_info["email"] else "teacher",
                is_active=True,
            )
            user.set_unusable_password()
            user.save()
        tokens = self._get_jwt_tokens(user)
        print(tokens)
        return HttpResponseRedirect(os.getenv("CORS_ALLOWED_ORIGIN") + f"/google?access={tokens['access']}&refresh={tokens['refresh']}")


    def _get_jwt_tokens(self, user):
        """
        Generate JWT tokens for the user.
        """
        # Implement JWT token generation logic here
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class WhoamiView(APIView):
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "User not found"}, status=404)
        user_data = {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "image_url": user.image_url,
        }
        return Response(user_data, status=200)

class AuthenthicateAdmin(APIView):
    def post(self, request):
        email, password = request.data.get("email"), request.data.get("password")
        user = get_user_model().objects.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=401)
        if user.role != "admin":
            return Response({"error": "User is not an admin"}, status=403)
        login(request, user)
        return HttpResponseRedirect("/admin/")  # Redirect to the admin page after successful login
