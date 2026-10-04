// src/data/policies.js
// All policy content in one place — update here, updates everywhere.
// Replace placeholders (support@smoothsip.in, smoothsip.in) with real values.

const CONTACT = {
  brand: 'Smooth Sip',
  email: 'support@smoothsip.in',
  website: 'smoothsip.in',
  gst: '24AXLPG7588B1ZC',
  instagram: '@smoothsip',
};

export const policies = {
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Introduction',
        body: [
          `At ${CONTACT.brand}, we respect your privacy and are committed to keeping your personal information safe. This Privacy Policy explains what information we collect, why we collect it, and how we use it when you visit our website, place an order, contact us, or use our services.`,
        ],
      },
      {
        heading: '1. Information We Collect',
        body: [`When you use our website or place an order, we may collect information such as:`],
        list: [
          'Name, email address and phone number',
          'Billing and shipping address',
          'Order and payment-related information',
          'Personalization details you provide for customized products',
          'Information you provide when contacting our customer support',
          'Basic website usage information such as device, browser, and interaction with our website',
        ],
        after: ['We only collect information that is reasonably required to provide our products and services.'],
      },
      {
        heading: '2. How We Use Your Information',
        body: ['We may use your information to:'],
        list: [
          'Process and deliver your orders',
          'Process payments and provide order confirmations',
          'Provide customer support and respond to your queries',
          'Manage personalized/customized orders',
          'Improve our website, products, and customer experience',
          'Prevent fraud, misuse, or unauthorized activity',
          'Send promotional communication where permitted and applicable',
        ],
        after: ['We do not sell your personal information to third parties.'],
      },
      {
        heading: '3. Payments & Shipping',
        body: [
          'Payments are processed through trusted payment service providers. We do not store your complete card, UPI, or banking credentials on our website.',
          'To deliver your order, necessary information such as your name, phone number, and delivery address may be shared with our shipping and logistics partners.',
        ],
      },
      {
        heading: '4. Cookies',
        body: [
          'Our website may use cookies and similar technologies to remember preferences, understand website usage, and improve your shopping experience.',
          'You can manage or disable cookies through your browser settings. Some website features may not work properly if cookies are disabled.',
        ],
      },
      {
        heading: '5. Third-Party Services',
        body: [
          'We may use trusted third-party service providers for payment processing, shipping, website hosting, analytics, customer support, and other services required to operate our business.',
          'These providers may process information only as necessary to provide their services and may have their own privacy policies.',
        ],
      },
      {
        heading: '6. Data Security',
        body: [
          'We take reasonable steps to protect your personal information from unauthorized access, misuse, loss, or disclosure. However, no online system can guarantee complete security.',
          'Please avoid sharing sensitive information through unsecured communication channels.',
        ],
      },
      {
        heading: '7. How Long We Keep Your Information',
        body: [
          'We retain personal information only for as long as reasonably necessary to provide our services, complete transactions, meet legal or accounting requirements, resolve disputes, and protect our business.',
          'When information is no longer required, we may securely delete or anonymize it, subject to applicable legal requirements.',
        ],
      },
      {
        heading: '8. Your Privacy Rights',
        body: [
          'Depending on applicable law, you may have rights regarding your personal information, including requesting access, correction, or deletion, or withdrawing consent where processing is based on consent.',
          'To make a privacy-related request, please contact us using the details below. We may need to verify your identity before processing your request.',
        ],
      },
      {
        heading: "9. Children's Privacy",
        body: [
          'Our website is not intended for children to independently place orders or provide personal information. If you believe a child has provided personal information to us, please contact us so that we can take appropriate action.',
        ],
      },
      {
        heading: '10. Changes to This Policy',
        body: [
          'We may update this Privacy Policy when our practices, services, or legal requirements change. Any updated version will be published on this page with a revised "Last Updated" date.',
        ],
      },
      {
        heading: '11. Contact Us',
        body: [
          'If you have any questions about this Privacy Policy or how we handle your personal information, please contact us:',
        ],
        contact: true,
      },
    ],
  },

  'refund-policy': {
    slug: 'refund-policy',
    title: 'Returns & Refunds',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Overview',
        body: [
          'We want you to love your Smooth Sip purchase. Please check your order as soon as it arrives.',
        ],
      },
      {
        heading: 'Returns',
        body: [
          'Return requests are accepted within 7 days of delivery for eligible products. Items must be unused, undamaged, and in their original packaging with all accessories.',
          'To request a return, please contact us with your order number and details of the issue.',
        ],
      },
      {
        heading: 'Damaged or Incorrect Products',
        body: [
          'Please contact us within 48 hours of delivery with clear photos or videos of the product and packaging. After verification, we will arrange a replacement or refund.',
        ],
      },
      {
        heading: 'Personalised Products',
        body: [
          'Personalised tumblers are made especially for you and cannot be returned unless they arrive damaged or incorrect.',
        ],
      },
      {
        heading: 'Exchanges',
        body: [
          'Exchanges are available for eligible damaged, defective, or incorrect products.',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Once we receive and inspect your return, we will notify you about your refund. Approved refunds will be processed to your original payment method within 7–10 business days. Processing times may vary by payment provider.',
        ],
      },
      {
        heading: 'Need Help?',
        body: [
          `For any questions, please get in touch with us through our Contact Us page or at ${CONTACT.email}.`,
        ],
      },
    ],
  },

  'shipping-policy': {
    slug: 'shipping-policy',
    title: 'Shipping, Returns & Refund Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Overview',
        body: [
          'At Smooth Sip, we believe your shopping experience should be as smooth as your sip. Here\'s everything you need to know about your order.',
        ],
      },
      {
        heading: '🚚 Shipping',
        body: [
          'We offer FREE SHIPPING across India.',
          'Orders are usually delivered within 7–12 business days after confirmation.',
          'Delivery may take a little longer during weekends, public holidays, extreme weather, or unexpected courier delays.',
          "Once your order leaves our warehouse, you'll receive a shipping confirmation with tracking details.",
          'Tracking may take up to 48 hours to start showing updates.',
        ],
      },
      {
        heading: "📦 Where's My Order?",
        body: [
          'Use the tracking details shared with you to follow your shipment.',
          "If your order hasn't arrived within 20 days of receiving the shipping confirmation, simply reach out to us with your order number, and our team will help you check the status.",
        ],
      },
      {
        heading: '↩️ Returns',
        body: [
          'Changed your mind? No worries.',
          'Return requests can be made within 7 days of delivery.',
          'The tumbler must be unused, undamaged, and in its original packaging.',
          'Products that have been used, damaged after delivery, or returned without their original packaging may not be eligible for return.',
          "Once we receive and inspect the product, we'll confirm whether it qualifies for a refund or replacement.",
          'Personalised tumblers will not be replaced or refunded.',
          'Applicable return shipping charges may be deducted from the refund.',
        ],
      },
      {
        heading: '💔 Damaged, Defective, or Wrong Product?',
        body: [
          "We've got you.",
          'If your order arrives damaged, defective, or incorrect, contact us as soon as possible with your order number and clear photos/videos of the product and packaging.',
          "After reviewing the issue, we'll work with you on the appropriate solution, which may include a replacement or refund.",
        ],
      },
      {
        heading: '💰 Refunds',
        body: [
          'For approved refunds, the eligible amount will be processed after the returned product has been received and inspected. The time taken for the amount to reflect in your account may depend on your payment method or bank.',
        ],
      },
      {
        heading: '💬 Need Help?',
        body: [
          'Still have a question? We\'re happy to help.',
          `Reach out to the ${CONTACT.brand} Support Team through our Contact Us page with your order details, and we'll get back to you as soon as possible.`,
        ],
      },
    ],
  },

  'cancellation-policy': {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Cancellations',
        body: ['At Smooth Sip, we keep cancellations simple:'],
        list: [
          "Orders can be cancelled within 24 hours of placing the order, provided they haven't been processed or shipped.",
          'Personalised orders cannot be cancelled once placed.',
          'Once an order is shipped, cancellation is not possible.',
          'For eligible cancellations, refunds will be processed after confirmation and may take a few business days to reflect.',
        ],
      },
      {
        heading: 'Need Help?',
        body: [
          `For cancellation assistance, please contact us through our Contact Us page with your order number.`,
        ],
      },
    ],
  },

  'terms-of-service': {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Welcome',
        body: [
          `Welcome to ${CONTACT.brand}. By visiting our website or purchasing our products, you agree to use our website and services responsibly and in accordance with these terms.`,
        ],
      },
      {
        heading: '1. Using Our Website',
        body: [
          'Our website is intended for personal and genuine shopping purposes. Please provide accurate information while creating an order, including your name, contact details, shipping address, and payment information.',
          'We may restrict or cancel orders that appear to contain incorrect information, suspicious activity, or misuse of our services.',
        ],
      },
      {
        heading: '2. Products & Information',
        body: [
          'We make every effort to display our products, colours, specifications, images, and prices as accurately as possible. However, slight differences in colour or appearance may occur depending on your screen or device.',
          'Product availability can change without prior notice. If a product becomes unavailable after you place an order, we will contact you and provide an appropriate resolution.',
        ],
      },
      {
        heading: '3. Pricing & Payments',
        body: [
          'All prices shown on our website are displayed in Indian Rupees (₹) unless stated otherwise. We reserve the right to update product prices, offers, or promotions when required.',
          'Orders are confirmed only after successful payment or confirmation of the applicable payment method.',
        ],
      },
      {
        heading: '4. Orders & Delivery',
        body: [
          'Once an order is placed, you are responsible for ensuring that the information provided is correct. Delivery timelines are estimates and may be affected by courier delays, holidays, weather, or circumstances outside our control.',
          'Please refer to our Shipping Policy and Cancellation Policy for further details.',
        ],
      },
      {
        heading: '5. Returns & Refunds',
        body: [
          'Returns, replacements, and refunds are handled according to our Shipping, Returns & Refund Policy. Please review that policy before making a purchase.',
        ],
      },
      {
        heading: '6. Website Content',
        body: [
          `All ${CONTACT.brand} branding, logos, product photographs, graphics, text, and other original website content belong to ${CONTACT.brand} or its respective owners. They may not be copied, reproduced, modified, or used commercially without permission.`,
        ],
      },
      {
        heading: '7. Changes to These Terms',
        body: [
          'We may update these terms whenever necessary. Any revised version will be published on this page, and continued use of our website means you accept the updated terms.',
        ],
      },
      {
        heading: '8. Contact Us',
        body: [
          'For questions and queries related to our terms of service, please reach out to us using the details below.',
        ],
        contact: true,
      },
    ],
  },
};

export const CONTACT_INFO = CONTACT;