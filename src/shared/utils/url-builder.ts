/**
 * Builder class to build URL
 */
export class UrlBuilder {
    private baseUrl: string
    private filters: string[] = []

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    addLanguageFilter(key: string, value: string): void {
        this.filters.push(`${key}:${value}`)
    }

    addCreatedFilter(key: string, value: string): void {
        this.filters.push(`${key}:>${value}`)
    }

    build(): string {
        if (this.filters.length === 0) return this.baseUrl

        const query: string = this.filters.join('&')
        return `${this.baseUrl}?q=${query}`
    }
}
