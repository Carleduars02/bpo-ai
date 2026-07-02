interface PhoneFrameProps {
  label:    string
  children: React.ReactNode
}

export function PhoneFrame({ label, children }: PhoneFrameProps) {
  return (
    <div className="flex w-[300px] shrink-0 flex-col items-center gap-3">
      <div className="relative h-[620px] w-[300px] rounded-[42px] bg-[#0a0a0a] p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-3 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-[#0a0a0a]" />
        <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-white">
          {/* Status bar */}
          <div className="flex h-8 items-center justify-between bg-white px-5 pt-1 text-[10px] font-medium text-[#111b21]">
            <span>9:41</span>
            <span>●●●● 📶 🔋</span>
          </div>
          <div className="h-[calc(100%-2rem)] w-full">
            {children}
          </div>
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
