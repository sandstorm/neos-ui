Feature: Inspector property editing and unapplied changes

    Mirrors test 1 of Tests/IntegrationTests/Fixtures/1Dimension/inspector.e2e.js
    (the page-title editing flow + unapplied-changes dialog branches). The
    second testcafe test in that fixture covered ClientEval-driven SelectBox
    dependencies and is already exercised by the create-new-nodes scenario
    "ClientEval updates dependent SelectBox options in the creation dialog".

    Background:
        Given A user with username "admin", password "password" and role "Neos.Neos:Administrator" exists
        And I log in with username "admin" and password "password"

    Scenario: Edit page title with URI sync, discard, then apply
        When I navigate to the "Discarding" page
        Then the inspector "title" field should show "Discarding"
        And the inspector "uriPathSegment" field should show "discarding"

        When I append "-привет!" to the inspector "title" field
        And I sync the URL path segment from the title
        Then the inspector "uriPathSegment" field should show "discarding-privet"

        When I discard the inspector changes
        Then the inspector "title" field should show "Discarding"

        When I append "-1" to the inspector "title" field
        And I apply the inspector changes
        Then the inspector "title" field should show "Discarding-1"

    Scenario: Unapplied-changes dialog - resume keeps the pending edit
        When I navigate to the "Discarding" page
        And I append "-resumed" to the inspector "title" field
        And I click outside the inspector to trigger the unapplied-changes overlay
        Then the unapplied-changes dialog should be visible
        When I resume editing in the unapplied-changes dialog
        Then the unapplied-changes dialog should not be visible
        And the inspector "title" field should show "Discarding-resumed"

    Scenario: Unapplied-changes dialog - discard reverts the pending edit
        When I navigate to the "Discarding" page
        And I append "-discarded" to the inspector "title" field
        And I click outside the inspector to trigger the unapplied-changes overlay
        Then the unapplied-changes dialog should be visible
        When I discard the inspector changes from the unapplied-changes dialog
        Then the inspector "title" field should show "Discarding"
