import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setFetching(true);

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load posts");
      }

      setPosts(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load posts.");
    } finally {
      setFetching(false);
    }
  }

  async function createPost(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Please enter a title and content.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post");
      }

      setPosts((prev) => [data.post, ...prev]);
      setTitle("");
      setContent("");
      setMessage("Post published successfully.");
      setActiveView("posts");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to publish post.");
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== id));
      setMessage("Post deleted successfully.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to delete post.");
    }
  }

  const filteredPosts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return posts;

    return posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        (post.tags || "").toLowerCase().includes(keyword)
      );
    });
  }, [posts, search]);

  const totalTags = useMemo(() => {
    const tags = new Set();

    posts.forEach((post) => {
      if (!post.tags) return;

      post.tags.split(",").forEach((tag) => {
        const cleaned = tag.trim().toLowerCase();

        if (cleaned) tags.add(cleaned);
      });
    });

    return tags.size;
  }, [posts]);

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getTags(tags) {
    if (!tags) return ["General"];

    const result = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return result.length ? result : ["General"];
  }

  function goToCreate() {
    setActiveView("create");

    setTimeout(() => {
      document.getElementById("editor")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-slate-950/90 px-4 py-6 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-black text-slate-950">
              G
            </div>

            <div>
              <h1 className="font-bold">
                Growfinix<span className="text-cyan-400">Blog</span>
              </h1>

              <p className="text-[11px] text-slate-500">
                Admin Dashboard
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Main Menu
            </p>

            <button
              onClick={() => setActiveView("overview")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                activeView === "overview"
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>⌂</span>
              Overview
            </button>

            <button
              onClick={() => setActiveView("posts")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                activeView === "posts"
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>▤</span>
              All Posts
            </button>

            <button
              onClick={goToCreate}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                activeView === "create"
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>＋</span>
              Create Post
            </button>
          </div>

          <div className="mt-auto rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">AI Assistant</span>

              <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
                ACTIVE
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Automatically generate relevant tags for your blog posts.
            </p>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          {/* HEADER */}
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-5 sm:px-8 lg:px-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {activeView === "overview"
                    ? "Overview"
                    : activeView === "posts"
                      ? "Content"
                      : "Editor"}
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {activeView === "overview"
                    ? "Welcome back, Creator"
                    : activeView === "posts"
                      ? "All Blog Posts"
                      : "Create New Post"}
                </h2>
              </div>

              <button
                onClick={goToCreate}
                className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                + New Post
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            {/* OVERVIEW */}
            {activeView === "overview" && (
              <>
                <section className="mb-7 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-cyan-400/[0.04] p-6 sm:p-7">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                        AI Powered CMS
                      </div>

                      <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
                        Create. Publish.
                        <span className="text-cyan-400"> Grow.</span>
                      </h3>

                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                        Manage your articles, write Markdown content, and let
                        AI automatically organize your posts with smart tags.
                      </p>
                    </div>

                    <button
                      onClick={goToCreate}
                      className="shrink-0 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                    >
                      Start Writing →
                    </button>
                  </div>
                </section>

                {/* STATS */}
                <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Total Posts
                    </p>
                    <p className="mt-3 text-3xl font-black">{posts.length}</p>
                    <p className="mt-2 text-xs text-cyan-400">
                      Published articles
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      AI Tags
                    </p>
                    <p className="mt-3 text-3xl font-black">{totalTags}</p>
                    <p className="mt-2 text-xs text-violet-400">
                      Generated automatically
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Technology
                    </p>
                    <p className="mt-3 text-xl font-black">
                      React + Node
                    </p>
                    <p className="mt-2 text-xs text-blue-400">
                      Full-stack application
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      AI Status
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />
                      <span className="font-bold text-emerald-300">
                        Active
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Auto-tagging enabled
                    </p>
                  </div>
                </section>

                {/* QUICK ACTIONS */}
                <section className="mb-8">
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                      Quick Actions
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      What would you like to do?
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <button
                      onClick={goToCreate}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-xl text-cyan-300">
                        ＋
                      </div>

                      <h4 className="font-bold">Create Article</h4>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Start writing a new Markdown blog post.
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveView("posts")}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-xl text-blue-300">
                        ▤
                      </div>

                      <h4 className="font-bold">Manage Posts</h4>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Search and manage all your published articles.
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveView("posts")}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10 text-xl text-violet-300">
                        ✦
                      </div>

                      <h4 className="font-bold">Explore Articles</h4>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Browse your latest content and AI-generated tags.
                      </p>
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* CREATE */}
            {activeView === "create" && (
              <section
                id="editor"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"
              >
                <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                      Markdown Editor
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      Write your article
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Write using Markdown and preview the formatted result
                      instantly.
                    </p>
                  </div>

                  <span className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-500">
                    Markdown supported
                  </span>
                </div>

                <form onSubmit={createPost}>
                  <div className="grid gap-5 xl:grid-cols-2">
                    {/* WRITE */}
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
                      <div className="border-b border-white/10 px-4 py-3">
                        <span className="text-sm font-semibold">Write</span>
                      </div>

                      <div className="p-5">
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter your article title..."
                          className="mb-5 w-full border-none bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-700"
                        />

                        <textarea
                          rows="18"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder={`Start writing your article...

# Heading

Write your content here.

**Bold text**
*Italic text*

- Point one
- Point two`}
                          className="w-full resize-none border-none bg-transparent text-sm leading-7 text-slate-300 outline-none placeholder:text-slate-700"
                        />
                      </div>
                    </div>

                    {/* PREVIEW */}
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
                      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <span className="text-sm font-semibold">
                          Live Preview
                        </span>

                        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase text-emerald-300">
                          Live
                        </span>
                      </div>

                      <div className="min-h-[500px] p-6">
                        {title || content ? (
                          <>
                            <h4 className="text-3xl font-black leading-tight">
                              {title || "Untitled Article"}
                            </h4>

                            <div className="my-5 h-px bg-white/10" />

                            <div className="prose prose-invert max-w-none">
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="mb-4 text-3xl font-black text-white">
                                      {children}
                                    </h1>
                                  ),

                                  h2: ({ children }) => (
                                    <h2 className="mb-3 mt-6 text-2xl font-bold text-white">
                                      {children}
                                    </h2>
                                  ),

                                  h3: ({ children }) => (
                                    <h3 className="mb-2 mt-5 text-xl font-bold text-white">
                                      {children}
                                    </h3>
                                  ),

                                  p: ({ children }) => (
                                    <p className="mb-4 text-sm leading-7 text-slate-400">
                                      {children}
                                    </p>
                                  ),

                                  strong: ({ children }) => (
                                    <strong className="font-bold text-white">
                                      {children}
                                    </strong>
                                  ),

                                  em: ({ children }) => (
                                    <em className="text-cyan-300">
                                      {children}
                                    </em>
                                  ),

                                  ul: ({ children }) => (
                                    <ul className="mb-4 ml-5 list-disc space-y-2 text-sm text-slate-400">
                                      {children}
                                    </ul>
                                  ),

                                  ol: ({ children }) => (
                                    <ol className="mb-4 ml-5 list-decimal space-y-2 text-sm text-slate-400">
                                      {children}
                                    </ol>
                                  ),

                                  li: ({ children }) => (
                                    <li>{children}</li>
                                  ),

                                  blockquote: ({ children }) => (
                                    <blockquote className="mb-4 border-l-2 border-cyan-400 pl-4 italic text-slate-500">
                                      {children}
                                    </blockquote>
                                  ),

                                  code: ({ children }) => (
                                    <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300">
                                      {children}
                                    </code>
                                  ),
                                }}
                              >
                                {content || "Start writing to see the preview."}
                              </ReactMarkdown>
                            </div>
                          </>
                        ) : (
                          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                              ✎
                            </div>

                            <h4 className="mt-4 font-bold">
                              Nothing here yet
                            </h4>

                            <p className="mt-2 max-w-xs text-sm text-slate-600">
                              Start writing your article and the formatted
                              Markdown preview will appear here.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-600">
                      ✦ AI auto-tagging will run when you publish.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-cyan-400 px-7 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {loading ? "Publishing..." : "Publish Article →"}
                    </button>
                  </div>
                </form>

                {message && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-slate-900 p-3 text-sm text-slate-300">
                    {message}
                  </div>
                )}
              </section>
            )}

            {/* POSTS */}
            {activeView === "posts" && (
              <section>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                      Content Library
                    </p>

                    <h3 className="mt-2 text-3xl font-black">
                      Your Articles
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {posts.length} published{" "}
                      {posts.length === 1 ? "article" : "articles"}
                    </p>
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 md:w-80"
                  />
                </div>

                {fetching ? (
                  <div className="rounded-2xl border border-white/10 p-10 text-center text-slate-500">
                    Loading articles...
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-xl">
                      📝
                    </div>

                    <h4 className="mt-4 font-bold">No articles found</h4>

                    <p className="mt-2 text-sm text-slate-600">
                      Create a new article to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map((post, index) => (
                      <article
                        key={post.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.045]"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[9px] font-bold uppercase text-cyan-300">
                                  Article
                                </span>

                                <span className="text-xs text-slate-600">
                                  {formatDate(post.created_at)}
                                </span>
                              </div>

                              <h4 className="text-xl font-bold">
                                {post.title}
                              </h4>
                            </div>

                            <span className="text-xs text-slate-700">
                              #{String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="mb-3 text-2xl font-bold text-white">
                                    {children}
                                  </h1>
                                ),

                                h2: ({ children }) => (
                                  <h2 className="mb-3 text-xl font-bold text-white">
                                    {children}
                                  </h2>
                                ),

                                p: ({ children }) => (
                                  <p className="mb-2 text-sm leading-6 text-slate-500">
                                    {children}
                                  </p>
                                ),

                                strong: ({ children }) => (
                                  <strong className="font-bold text-slate-300">
                                    {children}
                                  </strong>
                                ),
                              }}
                            >
                              {post.content.length > 400
                                ? `${post.content.slice(0, 400)}...`
                                : post.content}
                            </ReactMarkdown>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {getTags(post.tags).map((tag, tagIndex) => (
                              <span
                                key={`${post.id}-${tagIndex}`}
                                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-slate-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex justify-end border-t border-white/10 pt-3">
                            <button
                              onClick={() => deletePost(post.id)}
                              className="rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-400/10"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            <footer className="mt-14 border-t border-white/10 py-7 text-center">
              <p className="text-xs text-slate-600">
                Growfinix Blog CMS
              </p>

              <p className="mt-1 text-[11px] text-slate-700">
                React • Node.js • Express • PostgreSQL • AI
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;