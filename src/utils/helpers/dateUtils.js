import moment from 'moment';
import { TIME_FILTERS, DEFAULT_VALUES } from '../../constants';

export const getDateRange = (timeFilter, customDateRange = []) => {
    const today = moment();

    if (timeFilter === TIME_FILTERS.CUSTOM && customDateRange[0] && customDateRange[1]) {
        return {
            startDate: customDateRange[0].format(DEFAULT_VALUES.DATE_FORMAT),
            endDate: customDateRange[1].format(DEFAULT_VALUES.DATE_FORMAT),
            label: 'Custom Range'
        };
    }

    switch (timeFilter) {
        case TIME_FILTERS.TODAY:
            return {
                startDate: today.format(DEFAULT_VALUES.DATE_FORMAT),
                endDate: today.format(DEFAULT_VALUES.DATE_FORMAT),
                label: 'Today'
            };
        case TIME_FILTERS.YESTERDAY:
            const yesterday = moment().subtract(1, 'days');
            return {
                startDate: yesterday.format(DEFAULT_VALUES.DATE_FORMAT),
                endDate: yesterday.format(DEFAULT_VALUES.DATE_FORMAT),
                label: 'Yesterday'
            };
        case TIME_FILTERS.THIS_WEEK:
            return {
                startDate: today.clone().startOf('week').format(DEFAULT_VALUES.DATE_FORMAT),
                endDate: today.format(DEFAULT_VALUES.DATE_FORMAT),
                label: 'This Week'
            };
        case TIME_FILTERS.THIS_MONTH:
            return {
                startDate: today.clone().startOf('month').format(DEFAULT_VALUES.DATE_FORMAT),
                endDate: today.format(DEFAULT_VALUES.DATE_FORMAT),
                label: 'This Month'
            };
        case TIME_FILTERS.LAST_MONTH:
            const lastMonth = moment().subtract(1, 'month');
            return {
                startDate: lastMonth.clone().startOf('month').format(DEFAULT_VALUES.DATE_FORMAT),
                endDate: lastMonth.clone().endOf('month').format(DEFAULT_VALUES.DATE_FORMAT),
                label: 'Last Month'
            };
        default:
            return {
                startDate: today.format(DEFAULT_VALUES.DATE_FORMAT),
                endDate: today.format(DEFAULT_VALUES.DATE_FORMAT),
                label: 'Today'
            };
    }
};

export const formatDate = (date, format = DEFAULT_VALUES.DATE_FORMAT) => {
    return moment(date).format(format);
};

export const getMonthRange = (date) => {
    const month = moment(date);
    return {
        startDate: month.clone().startOf('month').format(DEFAULT_VALUES.DATE_FORMAT),
        endDate: month.clone().endOf('month').format(DEFAULT_VALUES.DATE_FORMAT),
        label: month.format('MMMM YYYY')
    };
}; 