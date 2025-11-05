import React from 'react';

function PaymentInstructions({ paymentMethod, orderNumber, totalAmount }) {
  const renderBankTransferInstructions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🏦</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Bank Transfer / NEFT / RTGS</h3>
            <p className="text-blue-100 text-sm">Recommended for B2B transactions</p>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-blue-600 mr-2">💳</span>
          Bank Account Details
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Bank Name</p>
            <p className="text-base font-bold text-gray-900">ICICI Bank</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Account Holder Name</p>
            <p className="text-base font-bold text-gray-900">ICE Premium Artisan Creamery</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Account Number</p>
            <p className="text-base font-bold text-gray-900 font-mono">1234567890</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">IFSC Code</p>
            <p className="text-base font-bold text-gray-900 font-mono">ICIC0001234</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Branch</p>
            <p className="text-base font-bold text-gray-900">Andheri East, Mumbai</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Account Type</p>
            <p className="text-base font-bold text-gray-900">Current Account</p>
          </div>
        </div>
      </div>

      {/* Amount Box */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-semibold mb-1">Amount to Transfer</p>
            <p className="text-4xl font-bold text-green-900">₹{totalAmount?.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-4xl">💰</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-green-300">
          <p className="text-xs text-green-700">
            <span className="font-semibold">Reference Number:</span> {orderNumber}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Please mention your order number in the transaction reference/remarks
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h4 className="font-bold text-blue-900 mb-2">📋 Step-by-Step Instructions:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Log in to your Internet Banking or visit your bank branch</li>
          <li>Initiate NEFT/RTGS/IMPS transfer to the above account</li>
          <li>Enter the exact amount: ₹{totalAmount?.toLocaleString('en-IN')}</li>
          <li>Add your order number <span className="font-mono font-bold">{orderNumber}</span> in remarks</li>
          <li>Complete the transaction and save the receipt/screenshot</li>
          <li>Upload the payment proof in your order details page</li>
        </ol>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
        <h4 className="font-bold text-yellow-900 mb-2">💡 Important Tips:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
          <li>NEFT/RTGS typically takes 2-4 hours for same-day processing</li>
          <li>IMPS is instant (available 24/7)</li>
          <li>Keep your transaction reference number safe</li>
          <li>Upload a clear screenshot or PDF of your payment confirmation</li>
          <li>We'll verify and confirm your payment within 24 hours</li>
        </ul>
      </div>
    </div>
  );

  const renderUPIInstructions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold">UPI Payment</h3>
            <p className="text-purple-100 text-sm">Quick & Instant Payment</p>
          </div>
        </div>
      </div>

      {/* UPI Details */}
      <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-purple-600 mr-2">💳</span>
          UPI Payment Details
        </h4>

        {/* QR Code Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white p-4 rounded-xl border-4 border-purple-300 shadow-lg">
            {/* Placeholder for QR Code - you can generate actual QR code here */}
            <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">📲</div>
                <p className="text-xs text-purple-700 font-semibold">Scan with any UPI app</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">Scan QR code to pay ₹{totalAmount?.toLocaleString('en-IN')}</p>
        </div>

        {/* UPI ID */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
          <p className="text-xs text-purple-700 font-semibold mb-2">UPI ID / VPA</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-purple-900 font-mono">icecream@icici</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText('icecream@icici');
                alert('UPI ID copied to clipboard!');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              📋 Copy
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold text-green-900">₹{totalAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            <span className="font-semibold">Note:</span> Add "{orderNumber}" in remarks
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <h4 className="font-bold text-purple-900 mb-2">📋 Payment Steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-purple-800">
          <li>Open your UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
          <li><strong>Option 1:</strong> Scan the QR code above</li>
          <li><strong>Option 2:</strong> Enter UPI ID manually: <span className="font-mono font-bold">icecream@icici</span></li>
          <li>Verify amount: ₹{totalAmount?.toLocaleString('en-IN')}</li>
          <li>Add order number <span className="font-mono font-bold">{orderNumber}</span> in remarks/note</li>
          <li>Confirm payment and save the screenshot</li>
          <li>Upload payment screenshot in your order details page</li>
        </ol>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <h4 className="font-bold text-green-900 mb-2">✅ Why UPI?</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
          <li>Instant payment confirmation</li>
          <li>Available 24x7, even on holidays</li>
          <li>No transaction charges</li>
          <li>Secure & government-backed</li>
          <li>Direct bank-to-bank transfer</li>
        </ul>
      </div>
    </div>
  );

  const renderChequeInstructions = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Business Cheque Payment</h3>
            <p className="text-orange-100 text-sm">For formal business transactions</p>
          </div>
        </div>
      </div>

      {/* Cheque Details */}
      <div className="bg-white border-2 border-orange-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-orange-600 mr-2">📋</span>
          Cheque Payment Details
        </h4>

        <div className="space-y-4">
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
            <p className="text-xs text-orange-700 font-semibold mb-2">Pay To (Payee Name)</p>
            <p className="text-xl font-bold text-orange-900">ICE Premium Artisan Creamery</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Cheque Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalAmount?.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Order Reference</p>
              <p className="text-lg font-bold text-gray-900 font-mono">{orderNumber}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-700 font-semibold mb-2">Mail Cheque To:</p>
            <p className="text-sm font-semibold text-blue-900">ICE Premium Artisan Creamery</p>
            <p className="text-sm text-blue-800">Factory Road, Andheri East</p>
            <p className="text-sm text-blue-800">Mumbai - 400069, Maharashtra</p>
            <p className="text-sm text-blue-800">Phone: +91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
        <h4 className="font-bold text-orange-900 mb-2">📋 Cheque Preparation Instructions:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-orange-800">
          <li>Write the cheque in favor of <strong>"ICE Premium Artisan Creamery"</strong></li>
          <li>Mention the exact amount: ₹{totalAmount?.toLocaleString('en-IN')} (in words and figures)</li>
          <li>Write order number <span className="font-mono font-bold">{orderNumber}</span> on the back of cheque</li>
          <li>Sign the cheque as per your bank signature</li>
          <li>Cross the cheque (draw two parallel lines on top-left)</li>
          <li>Add "A/C Payee Only" for security</li>
          <li>Take a photo/scan of the cheque before mailing</li>
          <li>Mail the cheque to the address above via registered post</li>
          <li>Upload the cheque photo/scan in your order details page</li>
        </ol>
      </div>

      {/* Important Notes */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <h4 className="font-bold text-red-900 mb-2">⚠️ Important Notes:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
          <li>Cheque clearance takes 3-7 business days</li>
          <li>Post-dated cheques are not accepted</li>
          <li>Ensure sufficient balance in your account</li>
          <li>Cheque bounce charges: ₹500 + bank charges</li>
          <li>Your order will be processed only after cheque clearance</li>
          <li>Stock will be reserved for 7 days from order date</li>
        </ul>
      </div>

      {/* Alternative */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h4 className="font-bold text-blue-900 mb-2">💡 Need Faster Processing?</h4>
        <p className="text-sm text-blue-800">
          Consider Bank Transfer (NEFT/RTGS) or UPI for instant payment confirmation and faster order processing.
        </p>
      </div>
    </div>
  );

  // Render based on payment method
  const renderInstructions = () => {
    switch (paymentMethod) {
      case 'OFFLINE_BANK_TRANSFER':
        return renderBankTransferInstructions();
      case 'OFFLINE_CASH':
        return renderUPIInstructions();
      case 'OFFLINE_CHEQUE':
        return renderChequeInstructions();
      default:
        return renderBankTransferInstructions();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {renderInstructions()}
    </div>
  );
}

export default PaymentInstructions;
