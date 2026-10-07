/**
 * 全站统一联系方式（纯常量，客户端组件也能引用）
 * 裸号码给 tel: 链接用，分组号码给人读（由裸号码派生，避免两处维护）。
 */
export const CONTACT_PHONE = "13880788802";

export const CONTACT_PHONE_DISPLAY = [
    CONTACT_PHONE.slice(0, 3),
    CONTACT_PHONE.slice(3, 7),
    CONTACT_PHONE.slice(7),
].join(" ");
