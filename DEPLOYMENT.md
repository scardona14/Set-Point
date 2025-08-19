# Set Point Deployment Guide

This guide covers deploying Set Point across all three implementations: Web/PWA, Capacitor mobile wrapper, and React Native.

## Prerequisites

- Node.js 18+ installed
- Git repository setup
- Platform-specific development tools (Xcode for iOS, Android Studio for Android)

## 1. Web/PWA Deployment

### Vercel (Recommended)

1. **Connect Repository**
   \`\`\`bash
   npm install -g vercel
   vercel login
   vercel --prod
   \`\`\`

2. **Environment Variables**
   Set these in your Vercel dashboard:
   - `NODE_ENV=production`
   - Any API keys or external service tokens

3. **Automatic Deployment**
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for pull requests

### Netlify Alternative

1. **Build and Deploy**
   \`\`\`bash
   npm run build:pwa
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=out
   \`\`\`

2. **Configuration**
   - Uses `netlify.toml` for build settings
   - Supports form handling and serverless functions

## 2. Capacitor Mobile Deployment

### iOS App Store

1. **Prerequisites**
   - Apple Developer Account ($99/year)
   - Xcode installed on macOS
   - iOS device for testing

2. **Build Process**
   \`\`\`bash
   npm run build:capacitor
   npx cap sync ios
   npx cap open ios
   \`\`\`

3. **Xcode Configuration**
   - Set bundle identifier (com.yourcompany.setpoint)
   - Configure signing certificates
   - Set deployment target (iOS 13+)
   - Add app icons and launch screens

4. **App Store Submission**
   - Archive build in Xcode
   - Upload to App Store Connect
   - Fill out app metadata
   - Submit for review

### Google Play Store

1. **Prerequisites**
   - Google Play Developer Account ($25 one-time)
   - Android Studio installed
   - Android device for testing

2. **Build Process**
   \`\`\`bash
   npm run build:capacitor
   npx cap sync android
   npx cap open android
   \`\`\`

3. **Android Studio Configuration**
   - Set application ID (com.yourcompany.setpoint)
   - Configure signing keys
   - Set minimum SDK version (API 22+)
   - Add app icons and splash screens

4. **Play Store Submission**
   - Generate signed APK/AAB
   - Upload to Google Play Console
   - Fill out store listing
   - Submit for review

## 3. React Native Deployment

### iOS (React Native)

1. **Build Process**
   \`\`\`bash
   cd react-native
   npm install
   cd ios && pod install && cd ..
   npm run build:ios
   \`\`\`

2. **Xcode Setup**
   - Open `ios/SetPointRN.xcworkspace`
   - Configure bundle identifier
   - Set up signing certificates
   - Archive and upload to App Store

### Android (React Native)

1. **Build Process**
   \`\`\`bash
   cd react-native
   npm install
   npm run build:android
   \`\`\`

2. **Signing Configuration**
   - Generate signing key
   - Configure `android/app/build.gradle`
   - Build signed APK/AAB

## 4. CI/CD Pipeline

### GitHub Actions

The included `.github/workflows/deploy.yml` provides:

- **Automated web deployment** to Vercel
- **PWA deployment** to Netlify
- **Mobile builds** for iOS and Android
- **React Native builds** for both platforms

### Required Secrets

Set these in GitHub repository secrets:

**Vercel:**
- `VERCEL_TOKEN`
- `ORG_ID`
- `PROJECT_ID`

**Netlify:**
- `NETLIFY_SITE_ID`
- `NETLIFY_AUTH_TOKEN`

**Mobile (optional for CI):**
- iOS signing certificates
- Android keystore files

## 5. Environment Configuration

### Production Environment Variables

\`\`\`bash
# Web/PWA
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://setpoint.app

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# API endpoints (if using external services)
NEXT_PUBLIC_API_URL=https://api.setpoint.app
\`\`\`

### Mobile-Specific Configuration

**iOS (Info.plist):**
\`\`\`xml
<key>NSCameraUsageDescription</key>
<string>Take photos for your tennis matches</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Find nearby tennis courts</string>
\`\`\`

**Android (AndroidManifest.xml):**
\`\`\`xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.VIBRATE" />
\`\`\`

## 6. Performance Optimization

### Web Performance
- Images optimized and served via CDN
- Service worker caching for offline support
- Code splitting and lazy loading
- Lighthouse score optimization

### Mobile Performance
- Native navigation for smooth transitions
- Optimized bundle sizes
- Platform-specific optimizations
- Memory management

## 7. Monitoring and Analytics

### Web Analytics
- Google Analytics integration
- Core Web Vitals monitoring
- Error tracking with Sentry (optional)

### Mobile Analytics
- App Store Connect analytics
- Google Play Console analytics
- Crashlytics for crash reporting

## 8. Maintenance

### Regular Updates
- Security patches
- Dependency updates
- Platform-specific updates (iOS/Android versions)
- Feature releases

### Backup Strategy
- User data export functionality
- Database backups (if using external storage)
- Code repository backups

## Support

For deployment issues:
1. Check the GitHub Actions logs
2. Review platform-specific documentation
3. Test locally before deploying
4. Monitor deployment status dashboards

---

**Next Steps:**
1. Choose your deployment platform(s)
2. Set up CI/CD pipeline
3. Configure environment variables
4. Test deployment process
5. Monitor and maintain
