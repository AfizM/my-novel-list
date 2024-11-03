"use client";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto my-0 px-9">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 mt-8">About MyNovelList</h2>
          <div className="prose dark:prose-invert max-w-none space-y-8">
            {/* Introduction Section */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <p className="text-lg leading-relaxed">
                MyNovelList is a community-driven platform dedicated to web
                novels, light novels, and translated works. Our mission is to
                help readers discover, track, and discuss their favorite web
                novels while building a vibrant community of novel enthusiasts.
              </p>
            </div>

            {/* Features Section */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">What We Offer</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">📚</div>
                    <p>Comprehensive web novel tracking system</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">⭐</div>
                    <p>Community reviews and ratings</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">📖</div>
                    <p>Personal reading lists and progress tracking</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">👥</div>
                    <p>Social features to connect with other readers</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">🎯</div>
                    <p>Novel recommendations based on your interests</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-6 w-6 text-primary mt-1">📱</div>
                    <p>Mobile-friendly interface for reading on the go</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Section */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Our Community</h3>
              <div className="space-y-4">
                <p className="leading-relaxed">
                  Join thousands of web novel enthusiasts in discussions, share
                  your thoughts through reviews, and keep track of your reading
                  journey. Our community spans across various genres and
                  interests:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-none space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-primary">•</span>
                      <span>Cultivation Novels</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-primary">•</span>
                      <span>Progression Fantasy</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-primary">•</span>
                      <span>Light Novels</span>
                    </li>
                  </ul>
                  <ul className="list-none space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-primary">•</span>
                      <span>Xianxia</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-primary">•</span>
                      <span>Wuxia</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-primary">•</span>
                      <span>Korean Novels</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Join Us Section */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Join Us Today</h3>
              <p className="leading-relaxed">
                Whether you&apos;re a casual reader or a dedicated web novel
                enthusiast, MyNovelList is your home for discovering, tracking,
                and discussing the latest and greatest in web novels. Join our
                growing community and start your reading journey today!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
