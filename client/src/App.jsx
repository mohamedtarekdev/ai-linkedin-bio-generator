import React, { useMemo, useState } from "react";
import { generateLinkedIn } from "./lib/api";

const tones = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "bold", label: "Bold" },
];

const targets = [
  { value: "headline", label: "Headline" },
  { value: "bio", label: "Bio" },
  { value: "about", label: "About" },
];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-xs text-slate-700">
      {children}
    </span>
  );
}

function Label({ children }) {
  return (
    <div className="mb-1 text-sm font-medium text-slate-700">{children}</div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={
        "h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-slate-900 outline-none " +
        "placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50 " +
        (props.className || "")
      }
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={
        "h-11 w-full rounded-xl border border-slate-200 bg-white/80 px-3 text-slate-900 outline-none " +
        "focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50 " +
        (props.className || "")
      }
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={
        "min-h-[120px] w-full resize-y rounded-xl border border-slate-200 bg-white/80 p-3 text-slate-900 outline-none " +
        "placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-200/50 " +
        (props.className || "")
      }
    />
  );
}

export default function App() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    yearsOfExperience: "",
    skills: "",
    tone: "professional",
    target: "headline",
  });

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const skillsPreview = useMemo(() => {
    const raw = form.skills || "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
  }, [form.skills]);

  const canSubmit = useMemo(() => {
    return (
      (form.role || "").trim().length > 0 &&
      (form.skills || "").trim().length > 0
    );
  }, [form.role, form.skills]);

  async function onGenerate(e) {
    e.preventDefault();
    setError("");
    setText("");

    if (!canSubmit) {
      setError("Please provide at least Role and Skills.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name?.trim(),
        role: form.role?.trim(),
        yearsOfExperience: form.yearsOfExperience?.trim(),
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tone: form.tone,
        target: form.target,
      };

      const res = await generateLinkedIn(payload);
      setText(res?.text || "");
      if (!res?.text) setError("No text returned from server.");
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-slate-900" />
              <h1 className="text-2xl font-semibold text-slate-900">
                LinkedIn Content Generator
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Generate LinkedIn headline, bio, or about section in seconds.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill>Target: {form.target}</Pill>
            <Pill>Tone: {form.tone}</Pill>
            <Pill>Skills: {skillsPreview.length}</Pill>
          </div>
        </div>

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Card */}
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-lg shadow-slate-200/50 backdrop-blur">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Input</h2>
              <p className="text-sm text-slate-600">
                Fill the fields then generate. Role + Skills are required.
              </p>
            </div>

            <form onSubmit={onGenerate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Mohamed"
                  />
                </div>

                <div>
                  <Label>Role *</Label>
                  <Input
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Years of experience</Label>
                  <Input
                    value={form.yearsOfExperience}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        yearsOfExperience: e.target.value,
                      }))
                    }
                    placeholder="e.g. 2"
                  />
                </div>

                <div>
                  <Label>Target</Label>
                  <Select
                    value={form.target}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, target: e.target.value }))
                    }
                  >
                    {targets.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Tone</Label>
                  <Select
                    value={form.tone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tone: e.target.value }))
                    }
                  >
                    {tones.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>Skills (comma separated) *</Label>
                  <Input
                    value={form.skills}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, skills: e.target.value }))
                    }
                    placeholder="Node.js, MySQL, REST APIs"
                    required
                  />
                </div>
              </div>

              {/* Skills chips */}
              {skillsPreview.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skillsPreview.map((s, idx) => (
                    <span
                      key={`${s}-${idx}`}
                      className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className={
                    "inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition " +
                    (loading || !canSubmit
                      ? "bg-slate-200 text-slate-500"
                      : "bg-slate-900 text-white hover:bg-slate-800")
                  }
                >
                  {loading ? "Generating..." : "Generate"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    setError("");
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear result
                </button>

                <div className="sm:ml-auto text-xs text-slate-500">
                  Tip: keep skills 5–10 for best output.
                </div>
              </div>
            </form>
          </div>

          {/* Output Card */}
          <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-lg shadow-slate-200/50 backdrop-blur">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Result</h2>
                <p className="text-sm text-slate-600">
                  The generated copy will appear here.
                </p>
              </div>

              <button
                type="button"
                onClick={onCopy}
                disabled={!text}
                className={
                  "inline-flex h-10 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition " +
                  (!text
                    ? "bg-slate-200 text-slate-500"
                    : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50")
                }
              >
                Copy
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Output will show up here..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Made by{" "}
          <a
            href="https://mohamed-tarek.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 underline"
          >
            Mohamed Tarek
          </a>
          . Source code on{" "}
          <a
            href="https://github.com/mohamedtarekdev/ai-linkedin-bio-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-900 underline"
          >
            GitHub
          </a>
          .
        </div>
      </div>
    </div>
  );
}
