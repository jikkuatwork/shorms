import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const contactForm = JSON.parse(fs.readFileSync(path.join(__dirname, '../contact-form.json'), 'utf-8'))
const feedbackSurvey = JSON.parse(fs.readFileSync(path.join(__dirname, '../feedback-survey.json'), 'utf-8'))
const userRegistration = JSON.parse(fs.readFileSync(path.join(__dirname, '../user-registration.json'), 'utf-8'))

describe('Example Form Schemas', () => {
  it('should load contact form schema', () => {
    expect(contactForm).toBeDefined()
    expect(Array.isArray(contactForm)).toBe(true)
    expect(contactForm.length).toBeGreaterThan(0)
  })

  it('should load feedback survey schema', () => {
    expect(feedbackSurvey).toBeDefined()
    expect(Array.isArray(feedbackSurvey)).toBe(true)
  })

  it('should load user registration schema', () => {
    expect(userRegistration).toBeDefined()
    expect(Array.isArray(userRegistration)).toBe(true)
  })

  it('should have valid field structures in contact form', () => {
    contactForm.forEach((page: any) => {
      expect(page.title).toBeDefined()
      expect(Array.isArray(page.fields)).toBe(true)

      page.fields.forEach((field: any) => {
        expect(field.type).toBeDefined()
        expect(field.name).toBeDefined()
        expect(field.label).toBeDefined()
      })
    })
  })

  it('should have field IDs within each form', () => {
    const checkFormIds = (pages: any[], formName: string) => {
      const ids: string[] = []
      pages.forEach((page: any) => {
        page.fields.forEach((field: any) => {
          if (field.id) {
            ids.push(field.id)
          }
        })
      })
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    }

    checkFormIds(contactForm, 'contact')
    checkFormIds(feedbackSurvey, 'feedback')
    checkFormIds(userRegistration, 'registration')
  })
})
