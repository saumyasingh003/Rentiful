"use client";

import { Amplify } from "aws-amplify";
import {
  Authenticator,
  Heading,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/* ================= Amplify Config ================= */
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_CLIENT_ID!,
    },
  },
});

console.log("Cognito User Pool ID:", process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID);
console.log("Cognito User Pool Client ID:", process.env.NEXT_PUBLIC_AWS_COGNITO_USER_CLIENT_ID);





/* ================= Routes ================= */
const authRoutes = ["/signin", "/signup"];
const publicRoutes = ["/", "/landing"];

/* ================= Custom UI ================= */
const components = {
  Header() {
    return (
      <View className="mb-3 text-left text-white">
        <Heading level={3} className="text-2xl font-bold">
          RENT
          <span className="text-red-500 font-semibold ml-1">IFUL</span>
        </Heading>
        <p className="mt-1 text-sm opacity-90">
          Welcome back! Please sign in to continue
        </p>
      </View>
    );
  },

  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <View className="text-center mt-3">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button
              onClick={toSignUp}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign up
            </button>
          </p>
        </View>
      );
    },
  },

  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();

      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend="Role"
            name="custom:role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="tenant">Tenant</Radio>
            <Radio value="manager">Manager</Radio>
          </RadioGroupField>
        </>
      );
    },

    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-3">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={toSignIn}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Sign in
            </button>
          </p>
        </View>
      );
    },
  },
};

/* ================= Form Fields ================= */
const formFields = {
  signIn: {
    username: {
      label: "Email",
      placeholder: "Enter your email",
      isRequired: true,
    },
    password: {
      label: "Password",
      placeholder: "Enter your password",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      label: "Username",
      placeholder: "Choose a username",
      isRequired: true,
    },
    email: {
      order: 2,
      label: "Email",
      placeholder: "Enter your email",
      isRequired: true,
    },
    password: {
      order: 3,
      label: "Password",
      placeholder: "Create a password",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      label: "Confirm Password",
      placeholder: "Confirm your password",
      isRequired: true,
    },
  },
};

/* ================= Auth Wrapper ================= */
const Auth = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") || pathname.startsWith("/tenants");

  const isAuthRoute = authRoutes.includes(pathname);
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/landing");


  useEffect(() => {
    if (user && isAuthPage) {
      router.push("/landing");
    }
  }, [user, isAuthPage, router]);
  // Redirect authenticated users away from auth pages

  // Public routes → no auth required
  if (isPublicRoute && !isAuthRoute) {
    return <>{children}</>;
  }

  // ✅ For authenticated users on protected/dashboard pages, render children directly
  if (user && !isAuthPage) {
    return <>{children}</>;
  }

  // ✅ Correct initial state - only show auth form with background on signin/signup pages
  const initialState = pathname === "/signup" ? "signUp" : "signIn";

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image - Only for auth pages */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/singlelisting-2.jpg')" }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Auth Card */}
      <div className="relative z-10 w-full">
        <Authenticator
          initialState={initialState}
          components={components}
          formFields={formFields}
        >
          {() => <>{children}</>}
        </Authenticator>
      </div>
    </div>
  );
};

export default Auth;
