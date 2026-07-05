export const COLLECTION_DESTINATION_SLUGS: Record<number, string> = {
  101: 'darjeeling-tour-package',
  15: 'kashmir-tour-package',
  115: 'sikkim-tourism-himalayan-adventures',
  22: 'ladakh-tour-packages',
  121: 'breathtaking-arunachal-travel-package',
  122: 'stunning-meghalaya-trip-package',
  126: 'best-nepal-tour-package-destinations',
  25: 'bhutan-tourism-packages',
  124: 'manali-package-mountain-adventures',
}

export function getDestinationSlugForCategory(categoryId: number): string | null {
  return COLLECTION_DESTINATION_SLUGS[categoryId] ?? null
}
