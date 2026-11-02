// Exact Figma exports shared with the brand flow are reused without duplicating image files.
const shared:Record<string,string>={'status.svg':'branding/status-icons.svg','success.svg':'branding/success-check.svg','sample-saved.png':'branding/sample-packaging.png','sample-details.png':'product-flow/sample-photo.png'};
export const productAsset=(file:string)=>`${import.meta.env.BASE_URL}images/${shared[file]||`product-flow/${file}`}`;
