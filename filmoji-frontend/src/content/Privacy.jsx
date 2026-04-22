import ReactMarkdown from 'react-markdown'

const content = `
# Movie Sharing Platform — Privacy Policy & Terms of Use

## 1. Privacy Policy

### 1.1 Overview

This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our movie sharing platform ("Platform"). By accessing or using the Platform, you agree to this policy.

---

### 1.2 Information We Collect

**a. Information You Provide**

- Account details (e.g., username, email)
- Profile information
- Uploaded content (movies, comments, metadata)

**b. Automatically Collected Information**

- IP address
- Device and browser type
- Usage data (pages visited, interactions)

**c. Cookies & Tracking**

We use cookies and similar technologies to improve functionality and analyze usage.

---

### 1.3 How We Use Information

We use your data to:

- Provide and maintain the Platform
- Personalize user experience
- Improve services and features
- Communicate updates or support messages
- Detect and prevent abuse or illegal activity

---

### 1.4 Sharing of Information

We may share information:

- With service providers (hosting, analytics)
- When required by law or legal process
- To protect rights, safety, or property
- In case of business transfers (e.g., merger, acquisition)

We do **not** sell personal data.

---

### 1.5 Data Retention

We retain data only as long as necessary for service functionality, legal obligations, and dispute resolution.

---

### 1.6 Data Security

We implement reasonable technical and organizational measures to protect your data. However, no system is completely secure.

---

### 1.7 Your Rights

Depending on your jurisdiction, you may access your data, request correction or deletion, or object to certain processing.

---

### 1.8 Children's Privacy

The Platform is not intended for users under 13. We do not knowingly collect data from children.

---

### 1.9 Changes to This Policy

We may update this policy. Continued use of the Platform means you accept the updated terms.

---

## 2. Terms of Use

### 2.1 Acceptance of Terms

By using the Platform, you agree to comply with these Terms of Use.

---

### 2.2 User Accounts

- You are responsible for your account and credentials
- You must provide accurate information
- You must not impersonate others

---

### 2.3 Content Ownership & Licensing

You retain ownership of content you upload. By uploading, you grant us a **non-exclusive, worldwide, royalty-free license** to host, display, and distribute content on the Platform.

---

### 2.4 Prohibited Content

You may **not** upload or share copyrighted content without authorization, illegal or harmful material, or content that violates privacy or intellectual property rights.

---

### 2.5 Copyright & DMCA Compliance

We respect intellectual property rights. Submit a takedown request if you believe your content has been infringed. We may remove content and suspend accounts for violations.

---

### 2.6 Platform Usage Rules

You agree not to reverse engineer or exploit the Platform, interfere with system integrity, or use bots or automated scraping tools without permission.

---

### 2.7 Termination

We may suspend or terminate your access if you violate these terms, if required by law, or if necessary to protect the Platform.

---

### 2.8 Disclaimer of Warranties

The Platform is provided "as is" without warranties of any kind, including availability, accuracy, or fitness for a particular purpose.

---

### 2.9 Limitation of Liability

To the maximum extent permitted by law, we are not liable for indirect or consequential damages. Your use of the Platform is at your own risk.

---

### 2.10 Governing Law

These terms are governed by the laws of the applicable jurisdiction where the service is operated.

---

### 2.11 Changes to Terms

We may update these Terms. Continued use constitutes acceptance of the updated version.

---

## 3. Contact

For questions regarding this Privacy Policy or Terms, contact us at support@filmoji.com.

---


`

function Privacy() {
    return (
        <div className="max-w-3xl mx-auto pt-24 px-6 pb-16 text-ink font-[Inter]
            [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-8
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-6
            [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-ink/80
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
            [&_li]:text-ink/80
            [&_strong]:text-ink [&_strong]:font-semibold
            [&_hr]:border-border [&_hr]:my-6">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    )
}

export default Privacy
