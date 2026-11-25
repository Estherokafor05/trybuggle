// A person's photo in a circle, or their initials when there is no photo.
import { initials, toneFor } from "@/lib/people";

const SIZES = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-20 text-2xl" } as const;

/** Photos we serve ourselves, or https photos from a sign-in provider such as Google. */
const safeImage = (src: string | null | undefined) => (src && (/^\/api\/avatars\/[0-9a-f-]{36}$/i.test(src) || /^https:\/\//.test(src)) ? src : null);

export function Avatar({
  name,
  image,
  size = "sm",
  alt = "",
}: {
  name: string | null | undefined;
  image?: string | null;
  size?: keyof typeof SIZES;
  /** Leave empty when the name is written next to it. */
  alt?: string;
}) {
  const src = safeImage(image);
  const box = `${SIZES[size]} inline-grid shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-white`;
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} referrerPolicy="no-referrer" className={`${box} bg-white object-cover`} />
    );
  return (
    <span role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} className={`${box} ${toneFor(name)} font-display font-bold text-navy`}>
      {initials(name)}
    </span>
  );
}
