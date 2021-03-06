import { ExternalClient, InstanceOptions, IOContext, RequestConfig } from '@vtex/api'

export interface SearchParams {
  filter: string
  page: number
  resultsPerPage: number
  sortBy: string
  terms: string
}

export interface AutocompleteParams {
  terms: string
}

const treatedStatusCodes = [404, 302]
const treatedErrors = (e: any) => {
  if (e.response && e.response.status && treatedStatusCodes.includes(e.response.status)) {
    return e.response.data
  }
  throw e
}

export default class Search extends ExternalClient {
  public apiKey?: string
  public secretKey?: string

  constructor(context: IOContext, options?: InstanceOptions) {
    super(`http://${context.account}.neemu.com/searchapi/v3`, context, {
      ...options,
      headers: {
        'Accept':'application/json',
        'Content-Type': 'application/json',
      },
    })
  }

  // This is initialized by the withSecretKeys directive
  public init(secretKeys: SecretKeys) {
    this.apiKey = secretKeys.apiKey
    this.secretKey = secretKeys.secretKey
  }

  public search (params: SearchParams): Promise<any> {
    return this.get(this.routes.search, { metric: 'chaordic-search', params })
  }

  public autocomplete (params: AutocompleteParams): Promise<any> {
    return this.get(this.routes.autocomplete, { metric: 'chaordic-autocomplete', params })
  }

  public popular (): Promise<any> {
    return this.get(this.routes.popular, { metric: 'chaordic-popular' })
  }

  private get routes () {
    return {
      autocomplete: '/autocompletes',
      popular: '/autocompletes/popular',
      search: '/search',
    }
  }

  private get (url: string, config?: RequestConfig) {
    const params = {
      ...config && config.params,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
    }

    return this.http.get(url, {
      ...config,
      params,
    }).catch(treatedErrors)
  }
}
