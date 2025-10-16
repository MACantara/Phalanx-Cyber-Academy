import { BasePage } from './base-page.js';

class CyberQuestPageClass extends BasePage {
    constructor() {
        super({
            url: 'https://example.com',
            title: 'CyberQuest Training',
            ipAddress: '104.26.10.72',
            securityLevel: 'safe',
            security: {
                isHttps: true,
                hasValidCertificate: true,
                certificate: {
                    valid: true,
                    issuer: 'Let\'s Encrypt Authority X3',
                    expires: BasePage.generateCertExpiration(12),
                    algorithm: 'RSA 2048-bit',
                    trusted: true,
                    extendedValidation: false
                },
                threats: null,
                riskFactors: [],
                securityFeatures: [
                    'Valid SSL/TLS certificate',
                    'Strong encryption',
                    'Regular security updates',
                    'Trusted certificate authority'
                ]
            }
        });
    }

    createContent() {
        return `
            <div class="p-6 text-gray-800 bg-white">
                <header class="border-b border-gray-200 pb-4 mb-6">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <i class="bi bi-shield-check text-white text-xl"></i>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">${this.title}</h1>
                            <p class="text-gray-600">Professional Cybersecurity Education</p>
                        </div>
                    </div>
                </header>

                <main class="space-y-6">
                    <section class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h2 class="text-lg font-semibold text-green-800 mb-2">✅ Secure Connection</h2>
                        <p class="text-green-700">This is a legitimate educational website with proper security measures.</p>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold mb-3">Training Modules</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="border border-gray-200 rounded p-4">
                                <h3 class="font-semibold">Email Security</h3>
                                <p class="text-sm text-gray-600">Learn to identify phishing attempts</p>
                            </div>
                            <div class="border border-gray-200 rounded p-4">
                                <h3 class="font-semibold">Web Security</h3>
                                <p class="text-sm text-gray-600">Recognize malicious websites</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-xl font-semibold mb-3">Contact Information</h2>
                        <div class="bg-gray-50 p-4 rounded">
                            <p><strong>Email:</strong> support@example.com</p>
                            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                            <p><strong>Address:</strong> 123 Security Blvd, Cyber City, CC 12345</p>
                        </div>
                    </section>
                </main>
            </div>
        `;
    }
}

// Export as page object for compatibility
export const CyberQuestPage = new CyberQuestPageClass().toPageObject();
