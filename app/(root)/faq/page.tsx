"use client";

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto my-0 px-9">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 mt-8">
            Frequently Asked Questions
          </h2>
          <div className="prose dark:prose-invert max-w-none space-y-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">❓</div>
                    <div>
                      <p className="font-semibold">What is MyNovelList?</p>
                      <p className="text-muted-foreground">
                        MyNovelList is a platform for tracking, reviewing, and
                        discovering web novels. Users can maintain their reading
                        lists, write reviews, and connect with other web novel
                        enthusiasts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Using the Platform</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">📚</div>
                    <div>
                      <p className="font-semibold">
                        How do I add a novel to my list?
                      </p>
                      <p className="text-muted-foreground">
                        Simply navigate to a novel&apos;s page and click the
                        &quot;Add to List&quot; button. You can then select your
                        reading status and chapter progress.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">📝</div>
                    <div>
                      <p className="font-semibold">Can I submit new novels?</p>
                      <p className="text-muted-foreground">
                        Yes! You can submit novels through our submission form.
                        All submissions are reviewed by our moderators before
                        being added to the database.
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
