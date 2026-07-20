import { PageHeader } from "@/components/ui/PageHeader";
import { DemoPill } from "@/components/ui/DemoPill";
import { Tag } from "@/components/ui/Tag";

export const metadata = { title: "Security" };

const SESSIONS = [
  { id: "s1", device: "Mac · Chrome 132", locale: "Lisbon, PT", current: true },
  { id: "s2", device: "iPad · Safari 18", locale: "Lisbon, PT", current: false },
  { id: "s3", device: "iPhone · Safari 18", locale: "Lisbon, PT", current: false },
];

export default function SecurityPage() {
  return (
    <>
      <div className="mb-6 flex justify-end">
        <DemoPill />
      </div>
      <PageHeader
        eyebrow="Security"
        title={
          <>
            The keys, the <span className="italic text-accent">locks</span>, and you.
          </>
        }
        body="Active sessions, password, and the second factor if you turn it on."
      />

      <div className="mt-10">
        <p className="eyebrow mb-3">Active sessions</p>
        <ol className="flex flex-col gap-px border border-line bg-line">
          {SESSIONS.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between bg-bg px-5 py-4"
            >
              <div className="flex flex-col">
                <span className="text-[13.5px] text-fg">{s.device}</span>
                <span className="text-[12px] text-fg-subtle">{s.locale}</span>
              </div>
              {s.current ? <Tag label="This device" variant="positive" /> : null}
            </li>
          ))}
        </ol>
        <button className="mt-4 inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg-soft px-3.5 text-[12.5px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg">
          Sign out other sessions
        </button>
      </div>

      <div className="mt-12">
        <p className="eyebrow mb-3">Password</p>
        <div className="rounded-[12px] border border-line bg-bg-soft p-5">
          <p className="text-[13.5px] text-fg-muted">Last changed 12 days ago.</p>
          <button className="mt-4 inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg px-3.5 text-[12.5px] text-fg">
            Change password
          </button>
        </div>
      </div>

      <div className="mt-12">
        <p className="eyebrow mb-3">Two-factor authentication</p>
        <div className="rounded-[12px] border border-line bg-bg-soft p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[13.5px] text-fg">Authenticator app</p>
              <p className="text-[12px] text-fg-subtle">TOTP · recommended</p>
            </div>
            <Tag label="Off" variant="muted" />
          </div>
          <button className="mt-4 inline-flex h-9 items-center gap-2 rounded-[8px] border border-line bg-bg px-3.5 text-[12.5px] text-fg">
            Set up
          </button>
        </div>
      </div>
    </>
  );
}
