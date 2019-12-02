import { Modularize } from './index'
import fetch from 'node-fetch'


jest.mock('node-fetch')


describe('Testing modules main functionalities', () => {
    const self = {}

    beforeEach(() => {
        self.templateContent = '<h1>Resolved! {{ test }}</h1>'
        self.mockFetchSuccess = new Promise(
            (rs, rj) => rs({status: 200, text: () => self.templateContent}))
        self.mockFetchFail = new Promise((rs, rj) => rj(undefined))
        self.fetchSideEffects = [self.mockFetchSuccess, self.mockFetchFail]
        fetch.fetch = () => self.fetchSideEffects.pop()
        self.module = new Modularize()
    })

    test('test constructor default parameters', () => {
        expect(self.module.templatesPath).toBe('/templates/')
        expect(self.module.data).toMatchObject({})
        expect(self.module.appendTo).toBe('.modularize')
        expect(self.module.startsFrom).toBe(1)
        expect(self.module.bypass).toEqual([])
        expect(self.module.extension).toBe('html')
    })

    it('test getTemplate', () => {
        let response = self.module.getTemplate(1)

        expect.assertions(2)
        expect(response).toMatchObject(self.mockFetchSuccess)
        return response.then(content => expect(content).toBe(self.templateContent))
    })

    test('parse parseContent', () => {
        let replacedValue = 'Awesome'
        self.module.data = {'*': {test: replacedValue}}
        let parsedContent = self.module.parseContent(1, self.templateContent)

        expect(parsedContent).toBe(self.templateContent.replace('{{ test }}', replacedValue))
    })

    test('test template parent selector', () => {
        expect(self.module.parents.length).toEqual(1)
    })
})
