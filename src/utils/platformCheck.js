export const isAndroidPlatform = () => { /* #ifdef APP-PLUS */ return uni.getSystemInfoSync().platform === "android"; /* #endif */ return false; };
