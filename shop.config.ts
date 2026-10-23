// Single place for shop branding / contact info. Edit here, not in components.
export const SHOP = {
  name: "Kho Sỉ Huy Thảo", // TODO(shopthaothao): confirm final shop name
  appTitle: "Shop Thảo Thảo - Báo Giá Sản Phẩm",
  address: "119/16A Mễ Cốc, Phường 15, Quận 8, TP. Hồ Chí Minh 71800",
  phones: [
    { tel: "0968844385", display: "096.88.44.385", label: "Ms.Thảo" },
    { tel: "0964727949", display: "0964.727.949", label: "Mr.Huy" },
  ],
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.168636043297!2d106.62734977457428!3d10.721473160205868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b05aa037fab%3A0x19e09ad5c2bcaa2!2zS2hvIFPhu4kgSHV5IFRo4bqjbw!5e0!3m2!1svi!2s!4v1765289921148!5m2!1svi!2s",
  copyright: "© 2024 Shop Thảo Thảo. Chuyên cung cấp dụng cụ sơn chất lượng cao.",
  defaultApiUrl: "https://shopthaothao-api.ngthanhhuy951.workers.dev",
} as const;
