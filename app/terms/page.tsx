import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Set Point",
  description: "Terms of Service for Set Point",
}

export default function TermsOfService() {
  return (
    <div className="container max-w-3xl py-12 px-4 md:py-20">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-sm md:prose-base dark:prose-invert">
        <p className="text-muted-foreground mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Set Point app, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this app.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Accounts</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our app.
        </p>
        <p className="mt-2">
          You are responsible for safeguarding the password that you use to access the app and for any activities or actions under your password.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Acceptable Use</h2>
        <p>
          You agree not to use the app in any way that causes, or may cause, damage to the app or impairment of the availability or accessibility of the app. You must not use the app in any way which is unlawful, illegal, fraudulent, or harmful.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
        <p>
          The app and its original content, features, and functionality are and will remain the exclusive property of Set Point and its licensors. The app is protected by copyright, trademark, and other laws.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Termination</h2>
        <p>
          We may terminate or suspend access to our app immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our app after those revisions become effective, you agree to be bound by the revised terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at support@setpoint.app.
        </p>

        <div className="mt-8 p-4 bg-muted text-muted-foreground text-sm rounded-lg border">
          <strong>Note:</strong> This is a boilerplate Terms of Service for the public launch. It should be reviewed and customized to match your exact legal obligations.
        </div>
      </div>
    </div>
  )
}
