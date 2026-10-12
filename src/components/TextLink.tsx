import { Anchor, type AnchorProps, type ElementProps } from '@mantine/core';
import { cx } from './cx';

export interface TextLinkProps extends AnchorProps, ElementProps<'a', keyof AnchorProps> {
  /** Muted ink instead of the accent (secondary links in captions and tables). */
  subtle?: boolean;
}

/**
 * Inline text link: accent colour (ink for the neutral zinc accent), underline on hover, focus ring.
 * Same look as Mantine `Anchor` under the kit theme and as the `.mvv-link` class for plain `<a>`/router links:
 * `<Link className="mvv-link" to="/x">`.
 */
export function TextLink({ subtle, className, ...rest }: TextLinkProps) {
  return <Anchor className={cx('mvv-link', className)} data-subtle={subtle || undefined} {...rest} />;
}
