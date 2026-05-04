Feature: Switch between dimensions

    Mirrors Tests/IntegrationTests/Fixtures/2Dimension/switchingDimensions.e2e.js.
    Switching the language to one not yet covered by the current document opens
    the variant creation dialog; choosing "Create Empty" persists a new variant
    and the tree updates to reflect that dimension's coverage.

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in to "twodimensions.localhost" with username "admin" and password "password"
        And I navigate to the "Home" page

    Scenario: Switch language to a dimension lacking the current variant, then switch back
        When I navigate to the "Translated page" page
        And I open the dimension switcher
        And I select "Danish" in the "Language" dimension
        Then the "Country" dimension should be set to "Denmark"
        When I apply the dimension change
        And I create an empty variant for the dimension change
        Then no tree node "Untranslated page" should be visible
        When I open the dimension switcher
        And I select "English (US)" in the "Language" dimension
        Then the "Country" dimension should be set to "Germany"
        When I apply the dimension change
        Then the "Untranslated page" tree node should be visible
