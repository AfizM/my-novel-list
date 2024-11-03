"use client";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto my-0 px-9">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 mt-8">Contact Us</h2>
          <div className="prose dark:prose-invert max-w-none space-y-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <p className="text-lg leading-relaxed">
                Have questions, suggestions, or found a bug? We&apos;d love to
                hear from you! Choose the best way to reach us below.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Ways to Reach Us</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">📧</div>
                    <div>
                      <p className="font-semibold">General Inquiries</p>
                      <p className="text-muted-foreground">
                        support@mynovellist.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">💼</div>
                    <div>
                      <p className="font-semibold">Business Inquiries</p>
                      <p className="text-muted-foreground">
                        business@mynovellist.com
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">🐛</div>
                    <div>
                      <p className="font-semibold">Bug Reports</p>
                      <p className="text-muted-foreground">
                        Visit our GitHub repository
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">⏱️</div>
                    <div>
                      <p className="font-semibold">Response Time</p>
                      <p className="text-muted-foreground">
                        24-48 hours (business days)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
