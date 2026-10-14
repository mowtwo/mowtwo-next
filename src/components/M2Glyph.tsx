/** M2 glyph logo — traced from deliverables/brand/m2-glyph.svg */
type Props = { height?: number; className?: string }

export default function M2Glyph({ height = 18, className }: Props) {
  return (
    <svg
      className={className}
      viewBox="270 395 715 414"
      height={height}
      width={(height * 715) / 414}
      role="img"
      aria-label="M2"
    >
      <path fill="var(--glyph-ink, #e9fbff)" d="M975.0 561.0 L791.0 561.0 L785.0 564.0 L639.5 702.0 L639.5 804.0 L939.0 804.0 L981.0 762.0 L981.0 725.0 L753.0 725.0 L747.0 720.0 L747.0 714.0 L822.0 642.0 L895.0 642.0Z" />
      <path fill="var(--glyph-ink, #e9fbff)" d="M896.0 478.0 L837.0 400.0 L703.0 400.0 L529.0 566.0 L520.0 567.0 L357.0 406.0 L347.0 404.0 L274.0 477.0 L274.0 759.0 L320.0 804.5 L366.0 804.5 L366.0 558.0 L372.0 551.0 L379.0 552.0 L521.0 694.0 L525.0 694.0 L739.0 482.5 L889.0 482.5 L896.0 486.0Z" />
      <path fill="var(--glyph-accent, #5fe6ff)" d="M838.0 399.0 L838.0 405.0 L896.0 480.0 L896.0 552.0 L891.0 562.0 L978.0 562.0 L981.0 555.0 L981.0 467.0 L912.0 399.0Z" />
    </svg>
  )
}
