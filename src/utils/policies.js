// src/utils/policies.js
// All policy content in one place — update here, updates everywhere.

const CONTACT = {
  brand: 'SmoothSip',
  email: 'connectsmoothsip@gmail.com',
  website: 'smoothsip.in',
  gst: '24AXLPG7588B1ZC',
  instagram: '@smoothsip',
  phone: '+91 9109575185',
  addressBhopal: '28/1 Shirdipuram, Mandakini Society, Kolar Road, Bhopal, Madhya Pradesh – 462042',
  addressMumbai: 'Building No. RB II/27, Quarter No. 4, near Parel Railway Station, Mumbai, Maharashtra – 400012',
};

export const policies = {
  /* ═══════════════════════════════════════════════
     PRIVACY POLICY
  ═══════════════════════════════════════════════ */
  'privacy-policy': {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Introduction',
        body: [
          `At ${CONTACT.brand}, we respect your privacy and are committed to keeping your personal information safe.`,
          'When you visit our website or place an order, we may collect information such as your name, phone number, email address, delivery address, payment details, and order information.',
        ],
      },
      {
        heading: 'How We Use Your Information',
        body: ['We use your information to:'],
        list: [
          'Process and deliver your orders.',
          'Contact you regarding your order or delivery.',
          'Provide customer support.',
          'Process payments and refunds.',
          'Improve our website, products, and customer experience.',
          'Send promotional offers or updates, if you have agreed to receive them.',
        ],
        after: ['We do not sell or rent your personal information to other companies.'],
      },
      {
        heading: 'Payment Information',
        body: [
          `${CONTACT.brand} does not store your complete card, UPI, or banking details on its own servers. Payments are processed through secure payment partners.`,
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Our website may use cookies and similar technologies to improve website performance, understand customer behaviour, and provide a better shopping experience.',
        ],
      },
      {
        heading: 'Third-Party Services',
        body: [
          'We may work with trusted third-party service providers such as payment gateways, shipping partners, and technology providers to complete your order and provide our services.',
        ],
      },
      {
        heading: 'Your Privacy',
        body: [
          'By using our website, you agree to this Privacy Policy. If you have any questions about how your information is used, please contact SmoothSip through our Contact Us page.',
          `${CONTACT.brand} may update this Privacy Policy from time to time. Any changes will be posted on this page.`,
        ],
      },
    ],
  },

  /* ═══════════════════════════════════════════════
     SHIPPING POLICY
  ═══════════════════════════════════════════════ */
  'shipping-policy': {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Overview',
        body: [
          `At ${CONTACT.brand}, we carefully pack every order so that your tumbler reaches you safely.`,
        ],
      },
      {
        heading: 'Shipping Across India',
        body: [`We currently ship ${CONTACT.brand} products across India.`],
      },
      {
        heading: 'Order Processing',
        body: [
          'Orders are generally processed after successful order confirmation and payment.',
          'For customised tumblers, please allow additional processing time as the product needs to be personalised before dispatch.',
        ],
      },
      {
        heading: 'Delivery Time',
        body: [
          'Estimated delivery time is generally 7–12 business days, depending on your location and the courier service.',
          'Delivery may take slightly longer during:',
        ],
        list: [
          'Festivals and holidays',
          'Sale periods',
          'Unexpected courier delays',
          'Weather or other circumstances beyond our control',
        ],
      },
      {
        heading: 'Tracking',
        body: [
          'Once your order is dispatched, tracking details may be shared with you through your registered contact details.',
        ],
      },
      {
        heading: 'Incorrect Address',
        body: [
          'Please make sure your shipping address, phone number, and other delivery details are correct before placing your order.',
          `${CONTACT.brand} is not responsible for delays or failed delivery caused by incorrect or incomplete information provided by the customer.`,
        ],
      },
      {
        heading: 'Damaged Package',
        body: [
          'If your package arrives damaged, please contact us as soon as possible with clear photos/videos of the package and product so that we can review the issue.',
          'For any shipping-related questions, please contact our customer support team.',
        ],
      },
    ],
  },

  /* ═══════════════════════════════════════════════
     CANCELLATION POLICY
  ═══════════════════════════════════════════════ */
  'cancellation-policy': {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Overview',
        body: [
          'We understand that sometimes you may need to cancel an order.',
        ],
      },
      {
        heading: 'Cancellation Window',
        body: [
          'You can request cancellation of your order within 12 hours of placing the order.',
          'After 12 hours, the order cannot be cancelled, as it may already have entered our processing or shipping process.',
        ],
      },
      {
        heading: 'Customised Products',
        body: [
          'Customised products require additional preparation and personalisation. Therefore, once the cancellation window of 12 hours has passed, the order cannot be cancelled.',
        ],
      },
      {
        heading: 'How to Request Cancellation',
        body: [
          'To request a cancellation, contact SmoothSip through our Contact Us page with your order details as soon as possible.',
          'Cancellation requests received after 12 hours will not be accepted.',
          'If an eligible cancellation is approved, the applicable refund will be processed according to our Refund Policy.',
        ],
      },
    ],
  },

  /* ═══════════════════════════════════════════════
     REFUND & RETURN POLICY
  ═══════════════════════════════════════════════ */
  'refund-policy': {
    slug: 'refund-policy',
    title: 'Refund & Return Policy',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: 'Overview',
        body: [
          `We want you to be happy with your ${CONTACT.brand} purchase. If there is a genuine issue with your product, we are here to help.`,
        ],
      },
      {
        heading: '7-Day Return Policy',
        body: [
          'Eligible products can be returned within 7 days of delivery.',
          'The product must be unused, undamaged, and in its original condition with the original packaging and accessories.',
        ],
      },
      {
        heading: 'Customised Products',
        body: [
          'Customised/personalised products cannot be returned, replaced, or exchanged.',
          "This includes products personalised with a customer's name or other approved personalisation.",
          'Please carefully check your personalisation details before placing your order.',
        ],
      },
      {
        heading: 'Damaged or Defective Product',
        body: [
          'If you receive a damaged, defective, or incorrect product, please contact us as soon as possible after delivery.',
          'We may ask you to provide photographs or videos of the product and packaging so that we can verify the issue.',
          `If the issue is approved, ${CONTACT.brand} may offer a replacement or another appropriate resolution.`,
        ],
      },
      {
        heading: 'Return Conditions',
        body: ['A return may not be accepted if:'],
        list: [
          'The product has been used or damaged by the customer.',
          'The product is returned without its original packaging or accessories.',
          'The issue is caused by normal wear and tear.',
          'The product has been customised/personalised.',
          'The return request is made after the 7-day return period.',
        ],
      },
      {
        heading: 'Refund',
        body: [
          'Once an approved return is received and inspected, we will process the applicable refund.',
          'The refund amount and method may depend on the original payment method and the reason for the return.',
          'Shipping charges, if applicable, may not be refundable.',
          `${CONTACT.brand} reserves the right to reject returns that do not meet the conditions mentioned above.`,
        ],
      },
    ],
  },

  /* ═══════════════════════════════════════════════
     TERMS OF SERVICE
  ═══════════════════════════════════════════════ */
  'terms-of-service': {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    lastUpdated: 'October 2026',
    sections: [
      {
        heading: '1. Website Content',
        body: [
          'We put effort into making our website informative, useful, and visually accurate.',
          `All text, photographs, graphics, videos, product visuals, designs, icons, logos, and other content displayed on the ${CONTACT.brand} website are created for the ${CONTACT.brand} brand or used with appropriate permission.`,
          'The content is provided for personal shopping and informational purposes.',
        ],
      },
      {
        heading: '2. Ownership of Brand Content',
        body: [
          `The ${CONTACT.brand} name, logo, branding, product presentation, website design, original content, photographs, graphics, videos, and other creative materials belong to ${CONTACT.brand} or their respective authorised owners.`,
          `No part of the website may be copied, reproduced, republished, modified, distributed, or commercially used without prior written permission from ${CONTACT.brand}.`,
        ],
      },
      {
        heading: '3. Product Use',
        body: [
          `${CONTACT.brand} products are designed for their intended everyday use.`,
          'Customers should use, clean, store, and maintain products according to the care instructions provided with the product or on the website.',
          `${CONTACT.brand} products should not be intentionally misused, modified, or used for purposes for which they are not designed.`,
        ],
      },
      {
        heading: '4. Personalisation Details',
        body: [
          'Where personalisation is available, the customer is responsible for providing the correct name or information they want to be added to the product.',
          'Customers should carefully review their entered details before confirming an order.',
          `${CONTACT.brand} will not be responsible for mistakes that result from incorrect information submitted by the customer.`,
        ],
      },
      {
        heading: '5. Customer Accounts',
        body: [
          'Certain features of the website may require customers to provide account or contact information.',
          'Customers are responsible for maintaining the confidentiality of their account credentials and for activities carried out through their account.',
          `If you believe your account has been accessed without your permission, you should inform ${CONTACT.brand} promptly.`,
        ],
      },
      {
        heading: '6. Promotions & Offers',
        body: [
          `From time to time, ${CONTACT.brand} may introduce promotional campaigns, discount codes, rewards, contests, or other special offers.`,
          'Individual promotions may have specific conditions, eligibility requirements, usage limits, or validity periods. These conditions will apply to the relevant promotion.',
          `${CONTACT.brand} may change or discontinue a promotional campaign when reasonably required.`,
        ],
      },
      {
        heading: '7. Website Availability',
        body: [
          `We aim to keep the ${CONTACT.brand} website accessible and functioning properly.`,
          'However, certain features may occasionally be unavailable because of maintenance, updates, technical problems, internet-related issues, or other circumstances outside our reasonable control.',
          'Temporary unavailability does not affect your right to contact us regarding an existing order or customer query.',
        ],
      },
      {
        heading: '8. Prohibited Activities',
        body: [`While using the ${CONTACT.brand} website, you must not:`],
        list: [
          'Use the website for unlawful purposes.',
          'Attempt to gain unauthorised access to any part of the website.',
          'Introduce harmful code, viruses, or other malicious technology.',
          "Interfere with the website's operation or security.",
          'Use automated systems to copy or collect website content without permission.',
          'Impersonate another person or provide misleading information.',
          `Use ${CONTACT.brand}'s brand or content for unauthorised commercial purposes.`,
        ],
      },
      {
        heading: '9. Changes to the Website',
        body: [
          `${CONTACT.brand} may add, remove, modify, or improve website features, product categories, content, tools, or other website elements as the brand grows.`,
          'We may also update these Terms of Service when necessary.',
          'The version published on the website will be considered the current version of these terms.',
        ],
      },
      {
        heading: 'Contact Us',
        body: [
          'For questions and queries related to our terms of service, please reach out to us using the details below.',
        ],
        contact: true,
      },
    ],
  },
};

export const CONTACT_INFO = CONTACT;