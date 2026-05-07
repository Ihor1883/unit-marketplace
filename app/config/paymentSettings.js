// Эти настройки управляют тем, какие кнопки оплаты видны на сайте
export const paymentConfig = {
  isExternalPaymentEnabled: true, // "Оплата наличкой/Блик" — сейчас включена
  isStripeActive: false,          // Stripe — выключен
  isPaypalActive: false,          // PayPal — выключен
};

export function getAvailableMethods() {
  const methods = [];
  if (paymentConfig.isExternalPaymentEnabled) methods.push('Manual Transfer / Cash');
  if (paymentConfig.isStripeActive) methods.push('Stripe');
  if (paymentConfig.isPaypalActive) methods.push('PayPal');
  return methods;
}