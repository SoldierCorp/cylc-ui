/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {
  getCurrentFontSize,
  expectedFontSize,
  resetFontSize,
  INITIAL_FONT_SIZE
} from '@/utils/font-size'

describe('User Profile', () => {
  it('Visits the user profile', () => {
    cy.visit('/#/user-profile')
    cy
      .get('h3.headline')
      .should('be.visible')
      .should('contain', 'Your Profile')
    cy.get('input#profile-username')
      .should('be.visible')
      .should('be.disabled')
  })
  it('Increases the font size', () => {
    resetFontSize()
    cy.visit('/#/user-profile')
    expect(parseFloat(INITIAL_FONT_SIZE)).to.be.equal(getCurrentFontSize())
    const clicks = 3
    // NOTE: had to use Promises in order to locate right element with Cypress
    cy.get('button#font-size-increase-button').then(($button) => {
      for (let i = 0; i < clicks; i++) {
        $button.click()
      }
      const currentFontSize = getCurrentFontSize()
      const expectedNewSize = expectedFontSize(true, clicks)
      expect(Math.round(expectedNewSize)).to.be.equal(Math.round(currentFontSize))
      cy
        .get('button#font-size-reset-button')
        .click()
    })
  })
  it('Decreases the font size', () => {
    resetFontSize()
    cy.visit('/#/user-profile')
    expect(parseFloat(INITIAL_FONT_SIZE)).to.be.equal(getCurrentFontSize())
    const clicks = 3
    cy.get('button#font-size-decrease-button').then(($button) => {
      for (let i = 0; i < clicks; i++) {
        $button.click()
      }
      const currentFontSize = getCurrentFontSize()
      const expectedNewSize = expectedFontSize(false, clicks)
      expect(Math.round(expectedNewSize)).to.be.equal(Math.round(currentFontSize))
      cy
        .get('button#font-size-reset-button')
        .click()
    })
  })
  it('Resets the font size', () => {
    resetFontSize()
    cy.visit('/#/user-profile')
    expect(parseFloat(INITIAL_FONT_SIZE)).to.be.equal(getCurrentFontSize())
    const clicks = 3
    cy.get('button#font-size-decrease-button').then(($button) => {
      for (let i = 0; i < clicks; i++) {
        $button.click()
      }
      cy.get('button#font-size-reset-button').then(($resetButton) => {
        $resetButton.click()
        const currentFontSize = getCurrentFontSize()
        const expectedNewSize = parseFloat(INITIAL_FONT_SIZE)
        expect(Math.round(expectedNewSize)).to.be.equal(Math.round(currentFontSize))
      })
    })
  })
})
