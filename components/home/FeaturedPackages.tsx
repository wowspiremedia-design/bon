import type { PackageCardProps } from '@/components/shared/PackageCard'
import FeaturedPackagesClient from './FeaturedPackagesClient'

interface Props {
  packages: PackageCardProps[]
  tabs: string[]
}

export default function FeaturedPackages({ packages, tabs }: Props) {
  return <FeaturedPackagesClient packages={packages} tabs={tabs} />
}
