@onedimension
Feature: Create new nodes

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Can create a new page via the document tree
        When I click the "add new page" toolbar button
        And I select the "Page_Test" node type
        And I go back from the node creation dialog
        And I select the "Page_Test" node type
        And I enter "TestPage" as the new node title
        And I confirm the node creation dialog
        Then the rendered page should contain "TestPage" in its navigation

    Scenario: Inline content creation, debounced change requests, and validation
        Given I track content-change requests
        When I add a "Headline_Test" node via the content tree
        And I set the last headline's text to "Helloworld!" as a "heading1"
        Then the rendered content collection should contain "Helloworld!"

        When I wait for the change-request debounce to settle
        And I reset the content-change request counter
        And I clear the last headline's text
        And I wait for the change-request debounce to settle
        Then a content-validation tooltip should be visible
        And no content-change request should have been sent

        When I set the last headline's text to "Some text" as a "heading1"
        And I wait for the change-request debounce to settle
        Then a content-change request should have been sent
