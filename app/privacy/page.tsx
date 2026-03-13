import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Set Point",
  description: "Privacy Policy for Set Point",
}

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-3xl py-12 px-4 md:py-20">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-sm md:prose-base dark:prose-invert">
        <p className="text-muted-foreground mb-4">Last Updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Name and email address</li>
          <li>Phone number (if provided for SMS notifications)</li>
          <li>Profile information and preferences</li>
          <li>Match history and scores</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Provide, maintain, and improve our application</li>
          <li>Send you technical notices, updates, and security alerts</li>
          <li>Communicate with you about matches, scheduling, and app updates (via email or SMS)</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our app</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
        <p>
          We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or electronic communication transmission is ever fully secure or error-free.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Services</h2>
        <p>
          We may share your information with outside vendors that we use for a variety of purposes, such as to send you emails and SMS messages on our behalf, push notifications to your mobile device on our behalf, provide voice recognition services to process your spoken queries and questions, help us analyze use of our application, and process and collect payments.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@setpoint.app.
        </p>

        <div className="mt-8 p-4 bg-muted text-muted-foreground text-sm rounded-lg border">
          <strong>Note:</strong> This is a boilerplate Privacy Policy for the public launch. It should be reviewed and customized to match your exact legal obligations.
        </div>
      </div>
    </div>
  )
}
