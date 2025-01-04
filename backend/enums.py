from enum import Enum


class StatusEnum(str, Enum):
    APPROVED = "approved"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    DECLINED = "declined"


class FirebaseTablesEnum(str, Enum):
    ADMINS = "admins"
    FOCUSES = "focuses"
    INDUSTRIES = "industries"
    MEMBERS = "members"
    REGIONS = "regions"
    SECURE_MEMBER_DATA = "secureMemberData"


class CompanySizeEnum(str, Enum):
    ONE = "1"
    TWO_TO_NINE = "2 - 9"
    TEN_TO_NINETEEN = "10 - 19"
    TWENTY_TO_FORTY_NINE = "20 - 49"
    FIFTY_TO_NINETY_NINE = "50 - 99"
    ONE_HUNDRED_TO_NINE_HUNDRED_NINETY_NINE = "100 - 999"
    ONE_THOUSAND_TO_FOUR_THOUSAND_NINE_HUNDRED_NINETY_NINE = "1000 - 4999"
    FIVE_THOUSAND_TO_TEN_THOUSAND = "5000 - 10000"
    MORE_THAN_TEN_THOUSAND = "More than 10000"
    NA = "N/A"


class YearsOfExperienceEnum(str, Enum):
    LESS_THAN_ONE = "Less than a year"
    ONE_TO_TWO = "1 - 2 years"
    THREE_TO_FOUR = "3 - 4 years"
    FIVE_TO_NINE = "5 - 9 years"
    TEN_TO_NINETEEN = "10 - 19 years"
    MORE_THAN_FIFTEEN = "More than 20 years"
