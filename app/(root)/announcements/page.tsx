"use client";

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto my-0 px-9">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 mt-8">Announcements</h2>
          <div className="prose dark:prose-invert max-w-none space-y-8">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">
                      New Features Released
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      November 3, 2024
                    </span>
                  </div>
                  <div className="space-y-4">
                    <p className="leading-relaxed">
                      We've added new features to enhance your MyNovelList
                      experience:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <div className="h-6 w-6 text-primary mt-1">📚</div>
                          <p>Improved novel tracking system</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="h-6 w-6 text-primary mt-1">🤝</div>
                          <p>Enhanced social features</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <div className="h-6 w-6 text-primary mt-1">⭐</div>
                          <p>Redesigned review system</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <div className="h-6 w-6 text-primary mt-1">📱</div>
                          <p>Mobile optimizations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">
                  Community Guidelines Update
                </h3>
                <span className="text-sm text-muted-foreground">
                  November 1, 2024
                </span>
              </div>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  We've updated our community guidelines to ensure a better
                  experience for all users. The new guidelines focus on:
                </p>
                <ul className="list-none space-y-2">
                  <li className="flex items-center space-x-2">
                    <span className="text-primary">•</span>
                    <span>Respectful discussion and feedback</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-primary">•</span>
                    <span>Quality review standards</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-primary">•</span>
                    <span>Content moderation improvements</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
