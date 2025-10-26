import * as CONSTANTS from 'src/shared/utils/constants'

import { UrlBuilder } from './url-builder'

describe('UrlBuilder', () => {
    it('returns base URL when no filters added', () => {
        const urlBuilder: UrlBuilder = new UrlBuilder('https://baseurl.com')
        expect(urlBuilder.build()).toBe('https://baseurl.com')
    })

    it('adds language filter', () => {
        const urlBuilder: UrlBuilder = new UrlBuilder('https://baseurl.com')
        urlBuilder.addLanguageFilter(CONSTANTS.LANGUAGE_QUERY_KEY, 'TypeScript')
        expect(urlBuilder.build()).toBe('https://baseurl.com?q=language:TypeScript')
    })

    it('adds created filter and combines with language', () => {
        const urlBuilder: UrlBuilder = new UrlBuilder('https://baseurl.com')
        urlBuilder.addLanguageFilter(CONSTANTS.LANGUAGE_QUERY_KEY, 'TypeScript')
        urlBuilder.addCreatedFilter(CONSTANTS.CREATED_QUERY_KEY, '2025-01-01')
        expect(urlBuilder.build()).toBe('https://baseurl.com?q=language:TypeScript&created:>2025-01-01')
    })
})
