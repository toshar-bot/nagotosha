import Image from 'next/image';
import {
  TOSHAR_MASCOT_ASSETS,
  type TosharMascotPose,
} from '@/data/toshar-mascot';

type TosharMascotProps = {
  pose: TosharMascotPose;
  className?: string;
  priority?: boolean;
  sizes: string;
};

export default function TosharMascot({
  pose,
  className,
  priority = false,
  sizes,
}: TosharMascotProps) {
  const asset = TOSHAR_MASCOT_ASSETS[pose];

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      className={className}
      priority={priority}
      sizes={sizes}
      aria-hidden="true"
      draggable={false}
      data-mascot-pose={pose}
    />
  );
}
