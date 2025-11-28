export const LocalizationKeys = {
    Prefixes: {
        AdminDashBoard: "AdminDashBoard",
        NavBar: "NavBar",
        CityPages: "CityPages",
        HomePage: "HomePage",
        Errors: "Errors"
    },
    HomePage: {
        chooseBestUniversity: "HomePage.chooseBestUniversity",
        openCareerPath: "HomePage.openCareerPath",
        takeCareerTest: "HomePage.takeCareerTest",
        estimateGrantChances: "HomePage.estimateGrantChances",
        raschet: "HomePage.raschet",
        viewOnMap: "HomePage.viewOnMap",
        searchUniversities: "HomePage.searchUniversities",
        chooseCity: "HomePage.chooseCity",
    },
    CityPages: {
        cities: "CityPages.cities",
    },
    NavBar: {
        title: "NavBar.title",
        forStudents: "NavBar.forStudents",
        about: "NavBar.about",
        universitiesTitle: "NavBar.universitiesTitle",
        universitiesDesc: "NavBar.universitiesDesc",
        careerTitle: "NavBar.careerTitle",
        careerDesc: "NavBar.careerDesc",
        platformTitle: "NavBar.platformTitle",
        platformDesc: "NavBar.platformDesc",
        chatTitle: "NavBar.chatTitle",
        chatDesc: "NavBar.chatDesc",
        communityTitle: "NavBar.communityTitle",
        communityDesc: "NavBar.communityDesc",
        assistantTitle: "NavBar.assistantTitle",
        assistantDesc: "NavBar.assistantDesc"
    },
    AdminDashBoard: {
        HomePage: "AdminDashBoard.HomePage",
        Dashboard: "AdminDashBoard.Dashboard",
        Institutions: "AdminDashBoard.Institutions",
        CreateInstitution: "AdminDashBoard.CreateInstitution",
        CreateInstitutionFormDescription: "AdminDashBoard.CreateInstitutionFormDescription",
        UpdateInstitutionInfo: "AdminDashBoard.UpdateInstitutionInfo",
        UpdateInstitutionInfoDescription: "AdminDashBoard.UpdateInstitutionInfoDescription",
        Update: "AdminDashBoard.Update",
        UniversityCreated: "AdminDashBoard.UniversityCreated",
        NationalCode: "AdminDashBoard.NationalCode",
        PrimeAdmin: "AdminDashBoard.PrimeAdmin",
        PrimeAdminNotAssigned: "AdminDashBoard.PrimeAdminNotAssigned",
        AssignPrimeAdmin: "AdminDashBoard.AssignPrimeAdmin",
        AssignPrimeAdminDescription: "AdminDashBoard.AssignPrimeAdminDescription",
        Assign: "AdminDashBoard.Assign",
        UniversityWithSameNationalCodeAlreadyExist: "AdminDashBoard.UniversityWithSameNationalCodeAlreadyExist",
        PrimeAdminAssigned: "AdminDashBoard.PrimeAdminAssigned",
        Users: "AdminDashBoard.Users",

        Description: "AdminDashBoard.Description",
        UpdateDescription: "AdminDashBoard.UpdateDescription",
        DescriptionUpdated: "AdminDashBoard.DescriptionUpdated",
        TranslateDescription: "AdminDashBoard.TranslateDescription",
        ImproveDescription: "AdminDashBoard.ImproveDescription",
    },


    Actions: {
        Edit: "Actions.Edit",
        Save: "Actions.Save",
        Cancel: "Actions.Cancel",
        Close: "Actions.Close",
        Translate: "Actions.Translate",
        TranslateAndImprove: "Actions.TranslateAndImprove",
        Translating: "Actions.Translating",
    },

    Messages: {
        Translation: {
            Success: "Messages.Translation.Success",
            Error: "Messages.Translation.Error",
            Loading: "Messages.Translation.Loading",
            Improving: "Messages.Translation.Improving",
        },
        Description: {
            UpdateSuccess: "Messages.Description.UpdateSuccess",
            UpdateError: "Messages.Description.UpdateError",
        }
    },

    Errors: {
        UnknownError: "Errors.UnknownError",
        // Add description specific errors
        DescriptionUpdateFailed: "Errors.DescriptionUpdateFailed",
        TranslationFailed: "Errors.TranslationFailed",
    },


    InstitutionAdminMenu: {
        Analytics: "InstitutionAdminMenu.Analytics",
        Insights: "InstitutionAdminMenu.Insights",
        Conversations: "InstitutionAdminMenu.Conversations",
        Ambassadors: "InstitutionAdminMenu.Ambassadors",
        Prospects: "InstitutionAdminMenu.Prospects",
        Moderation: "InstitutionAdminMenu.Moderation",
        Content: "InstitutionAdminMenu.Content",
        Community: "InstitutionAdminMenu.Community",
        Events: "InstitutionAdminMenu.Events",
        Customization: "InstitutionAdminMenu.Customization",
        AdminUsers: "InstitutionAdminMenu.AdminUsers",
        Settings: "InstitutionAdminMenu.Settings",

        // Submenu items
        Engagement: "InstitutionAdminMenu.Engagement",
        Prospect: "InstitutionAdminMenu.Prospect",
        Ambassador: "InstitutionAdminMenu.Ambassador",
        Applications: "InstitutionAdminMenu.Applications",
        Manage: "InstitutionAdminMenu.Manage",
        Inbox: "InstitutionAdminMenu.Inbox",
        Outbox: "InstitutionAdminMenu.Outbox",
        Invitations: "InstitutionAdminMenu.Invitations",
        Timesheet: "InstitutionAdminMenu.Timesheet",
        Invite: "InstitutionAdminMenu.Invite",
        Degrees: "InstitutionAdminMenu.Degrees",
        Features: "InstitutionAdminMenu.Features",
        General: "InstitutionAdminMenu.General",
        Departments: "InstitutionAdminMenu.Departments",
        EducationPrograms: "InstitutionAdminMenu.EducationPrograms",
        Posts: "InstitutionAdminMenu.Posts",
    }
} as const;

export default LocalizationKeys;