declare module '@payload-config' {
    import type { PayloadConfig } from 'payload'

    const config:
        | PayloadConfig
        | Promise<PayloadConfig>

    export default config
}
