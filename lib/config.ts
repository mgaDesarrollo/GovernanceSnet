export const config = {
    agix: {
        price: process.env.NEXT_PUBLIC_AGIX_PRICE ? parseFloat(process.env.NEXT_PUBLIC_AGIX_PRICE) : 0.28,
        decimals: process.env.NEXT_PUBLIC_AGIX_DECIMALS ? parseInt(process.env.NEXT_PUBLIC_AGIX_DECIMALS) : 8,
    }
}