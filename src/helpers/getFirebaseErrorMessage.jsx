export const getFirebaseErrorMessage = (error) => {
  if (!error || !error.code) return "An unexpected error occurred. Please try again.";
  
  switch (error.code) {
    case 'auth/email-already-in-use':
      return "This email is already registered. Please log in.";
    case 'auth/invalid-email':
      return "The email address is invalid.";
    case 'auth/user-not-found':
      return "No account found with this email.";
    case 'auth/wrong-password':
      return "Incorrect password. Please try again.";
    case 'auth/weak-password':
      return "The password is too weak. Please use a stronger password.";
    case 'auth/too-many-requests':
      return "Too many failed login attempts. Please try again later.";
    case 'auth/invalid-credential':
      return "Invalid email or password.";
    default:
      return "Authentication failed. Please check your details.";
  }
};
