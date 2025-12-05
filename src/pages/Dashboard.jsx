import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Spin, Statistic, Radio, Button, Alert, DatePicker, Modal, message, Input } from 'antd';
import {
  UserOutlined,
  DollarCircleOutlined,
  InboxOutlined,
  FieldTimeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FilterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import ModernCard from '../components/Dashboard/ModernCard';

// Import your API services
import { getInvoiceDashboard } from '../services/invoiceService';
import { getStockSummary } from '../services/stockService';
import { getAllCustomers } from '../services/customerApi';
import { getQuantityUpdates, acceptQuantityUpdate, rejectQuantityUpdate } from '../services/quantityUpdateApi';
import { getRecords } from '../services/recordService';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    invoices: {},
    stock: {},
    customers: [],
    records: [],
    quantityUpdates: []
  });
  const [timeFilter, setTimeFilter] = useState('today'); // 'today', 'yesterday', 'thisWeek', 'thisMonth', 'lastMonth', 'custom'
  const [customDateRange, setCustomDateRange] = useState([moment(), moment()]);
  const [error, setError] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentRecord, setCurrentRecord] = useState(null);

  // Get date range based on selected filter
  const getDateRange = () => {
    const today = moment();

    if (timeFilter === 'custom' && customDateRange[0] && customDateRange[1]) {
      return {
        startDate: customDateRange[0].format('YYYY-MM-DD'),
        endDate: customDateRange[1].format('YYYY-MM-DD'),
        label: 'Custom Range'
      };
    }

    switch (timeFilter) {
      case 'today':
        return {
          startDate: today.format('YYYY-MM-DD'),
          endDate: today.format('YYYY-MM-DD'),
          label: 'Today'
        };
      case 'yesterday':
        const yesterday = moment().subtract(1, 'days');
        return {
          startDate: yesterday.format('YYYY-MM-DD'),
          endDate: yesterday.format('YYYY-MM-DD'),
          label: 'Yesterday'
        };
      case 'thisWeek':
        return {
          startDate: today.clone().startOf('week').format('YYYY-MM-DD'),
          endDate: today.format('YYYY-MM-DD'),
          label: 'This Week'
        };
      case 'thisMonth':
        return {
          startDate: today.clone().startOf('month').format('YYYY-MM-DD'),
          endDate: today.format('YYYY-MM-DD'),
          label: 'This Month'
        };
      case 'lastMonth':
        const lastMonth = moment().subtract(1, 'month');
        return {
          startDate: lastMonth.clone().startOf('month').format('YYYY-MM-DD'),
          endDate: lastMonth.clone().endOf('month').format('YYYY-MM-DD'),
          label: 'Last Month'
        };
      default:
        return {
          startDate: today.format('YYYY-MM-DD'),
          endDate: today.format('YYYY-MM-DD'),
          label: 'Today'
        };
    }
  };

  // Handle specific month selection
  const handleMonthSelect = (date) => {
    if (!date) return;

    setCustomDateRange([
      date.clone().startOf('month'),
      date.clone().endOf('month')
    ]);

    setTimeFilter('custom');
    setShowDateModal(false);

    // Automatically load data for the selected month
    loadDashboardDataForRange(
      date.clone().startOf('month').format('YYYY-MM-DD'),
      date.clone().endOf('month').format('YYYY-MM-DD'),
      `${date.format('MMMM YYYY')}`
    );
  };

  // Handle date range selection
  const handleRangeSelect = (dates) => {
    if (!dates || dates.length !== 2) return;

    setCustomDateRange(dates);
    setTimeFilter('custom');
    setShowDateModal(false);

    // Automatically load data for the selected range
    loadDashboardDataForRange(
      dates[0].format('YYYY-MM-DD'),
      dates[1].format('YYYY-MM-DD'),
      'Custom Range'
    );
  };

  // Load dashboard data with specific date range
  const loadDashboardDataForRange = async (startDate, endDate, label) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all customers first to have their data
      let customersData = { customers: [] };
      try {
        customersData = await getAllCustomers();
      } catch (error) {
        console.error('Error fetching customers data:', error);
      }

      // Rest of API calls
      let invoiceData = {};
      let stockData = {};
      let recordsData = { data: [] };
      let quantityUpdatesData = { data: [] };

      try {
        invoiceData = await getInvoiceDashboard();
      } catch (error) {
        console.error('Error fetching invoice data:', error);
      }

      try {
        stockData = await getStockSummary({ startDate, endDate });
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }

      try {
        recordsData = await getRecords(1, 1000, { startDate, endDate });
      } catch (error) {
        console.error('Error fetching records data:', error);
      }

      try {
        // Get quantity updates
        quantityUpdatesData = await getQuantityUpdates({ startDate, endDate });
      } catch (error) {
        console.error('Error fetching quantity updates:', error);
        quantityUpdatesData = { data: [] };
      }

      setDashboardData({
        invoices: invoiceData,
        stock: stockData,
        customers: customersData.customers || [],
        records: recordsData?.data || [],
        quantityUpdates: quantityUpdatesData?.data || [],
        dateRange: {
          startDate,
          endDate,
          label
        }
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    const { startDate, endDate, label } = getDateRange();
    await loadDashboardDataForRange(startDate, endDate, label);
  };

  // Initial data load and when filter changes
  useEffect(() => {
    if (timeFilter !== 'custom') {
      loadDashboardData();
    }
  }, [timeFilter]);

  // Calculate total milk stock from stock data
  const getTotalMilkStock = () => {
    if (!dashboardData.stock?.totals) return 0;
    return dashboardData.stock.totals.stockIn || 0;
  };

  // Calculate remaining milk stock from stock data
  const getRemainingMilkStock = () => {
    if (!dashboardData.stock?.totals) return 0;
    return dashboardData.stock.totals.currentStock || 0;
  };

  // Calculate total revenue from invoice data
  const getTotalRevenue = () => {
    if (!dashboardData.invoices?.summary) return 0;
    return dashboardData.invoices.summary.totalAmount || 0;
  };

  // Calculate remaining customer payments from invoice data
  const getRemainingPayments = () => {
    if (!dashboardData.invoices?.summary) return 0;
    return dashboardData.invoices.summary.totalDue || 0;
  };

  // Get active customers count
  const getActiveCustomersCount = () => {
    return dashboardData.customers.filter(c => c.isActive).length;
  };

  // Handler for Accept
  const handleAccept = async (record) => {
    console.log('Accepting record:', record);
    try {
      await acceptQuantityUpdate(record._id, record.newQuantity);
      message.success('Order accepted!');
      loadDashboardData();
    } catch (error) {
      message.error('Failed to accept the order.');
    }
  };

  // Opens the reject modal to enter a reason
  const showRejectModal = (record) => {
    setCurrentRecord(record);
    setRejectModalVisible(true);
    setRejectReason('');
  };

  // Submit the rejection with reason
  const submitReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('Please enter a reason for rejection.');
      return;
    }

    try {
      // Pass the rejection reason to the API
      await rejectQuantityUpdate(currentRecord._id, rejectReason);
      message.success('Order rejected successfully!');
      setRejectModalVisible(false);
      setRejectReason('');
      loadDashboardData(); // Refresh the table to show updated status
    } catch (error) {
      console.error('Error rejecting order:', error);
      message.error('Failed to reject the order.');
    }
  };

  // Handler for Reject (legacy method, now just shows modal)
  const handleReject = async (record) => {
    showRejectModal(record);
  };

  // New columns for quantity updates
  const quantityUpdateColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(text).format('DD MMM YYYY'),
    },
    {
      title: 'Customer No',
      dataIndex: ['customer', 'customerNo'],
      key: 'customerNo',
    },
    {
      title: 'Customer Name',
      dataIndex: ['customer', 'name'],
      key: 'customerName',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text) => text.charAt(0).toUpperCase() + text.slice(1),
    },
    {
      title: 'Milk Type',
      dataIndex: ['milkType', 'name'],
      key: 'milkType',
    },
    {
      title: 'Subcategory',
      dataIndex: ['subcategory', 'name'],
      key: 'subcategory',
    },
    {
      title: 'Old Quantity',
      dataIndex: 'oldQuantity',
      key: 'oldQuantity',
    },
    {
      title: 'New Quantity',
      dataIndex: 'newQuantity',
      key: 'newQuantity',
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      render: (diff) => (
        <span style={{ color: diff > 0 ? 'green' : diff < 0 ? 'red' : 'black' }}>
          {diff > 0 ? '+' : ''}{diff}
        </span>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Status/Action',
      key: 'action',
      render: (_, record) => {
        // If order is accepted
        if (record.isAccept || record.status === 'accepted') {
          return (
            <Tag color="success" style={{ padding: '4px 8px' }}>
              Accepted
            </Tag>
          );
        }

        // If order is rejected
        if (record.status === 'rejected') {
          return (
            <Tag color="error" style={{ padding: '4px 8px' }}>
              Rejected
            </Tag>
          );
        }

        // If order is pending (neither accepted nor rejected)
        return (
          <span>
            <Button
              type="primary"
              size="small"
              style={{ marginRight: 8, backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
              onClick={() => handleAccept(record)}
            >
              Accept
            </Button>
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => handleReject(record)}
            >
              Reject
            </Button>
          </span>
        );
      },
    },
  ];

  // Time filter options
  const timeFilterOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' }
  ];

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const { dateRange } = dashboardData;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center">
          <Radio.Group
            options={timeFilterOptions}
            onChange={(e) => setTimeFilter(e.target.value)}
            value={timeFilter}
            optionType="button"
            buttonStyle="solid"
            className="mr-4"
          />

          {/* Custom Date Range Button */}
          <Button
            icon={<FilterOutlined />}
            type={timeFilter === 'custom' ? 'primary' : 'default'}
            onClick={() => setShowDateModal(true)}
            className="mr-4 !bg-blue-500 !text-white hover:!bg-blue-600"
          >
            Custom Range
          </Button>

          <Button icon={<ReloadOutlined />} onClick={loadDashboardData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      <Modal
        title="Select Date Range"
        open={showDateModal}
        onCancel={() => setShowDateModal(false)}
        footer={null}
        centered
      >
        <div className="p-4">
          <div className="mb-8">
            <h4 className="mb-4">Select a specific month</h4>
            <DatePicker
              picker="month"
              onChange={handleMonthSelect}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <h4 className="mb-4">Or select a custom date range</h4>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleRangeSelect}
            />
          </div>
        </div>
      </Modal>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-6"
        />
      )}

      {/* Stats Overview */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <ModernCard
            title="Total Customers"
            value={getActiveCustomersCount()}
            subValue="Active customers"
            icon={<UserOutlined />}
            iconBackgroundColor="#722ed1"
            color="#722ed1"
            shadow={true}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ModernCard
            title="Total Milk Stock"
            value={`${getTotalMilkStock()}L`}
            subValue="Stock received this month"
            icon={<InboxOutlined />}
            iconBackgroundColor="#1890ff"
            color="#1890ff"
            shadow={true}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ModernCard
            title="Remaining Milk Stock"
            value={`${getRemainingMilkStock()}L`}
            subValue="Available stock"
            icon={<InboxOutlined />}
            iconBackgroundColor="#fa8c16"
            color="#fa8c16"
            shadow={true}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ModernCard
            title="Total Revenue"
            value={`₹${getTotalRevenue()}`}
            subValue={`Pending: ₹${getRemainingPayments()}`}
            icon={<DollarCircleOutlined />}
            iconBackgroundColor="#52c41a"
            color="#52c41a"
            shadow={true}
          />
        </Col>
      </Row>

      {/* Customer Records Table */}
      <Card
        title={
          <div>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Quantity Updates for {dateRange?.label || 'Selected Period'}
            {dateRange && (
              <Tag color="blue" style={{ marginLeft: 12 }}>
                {dateRange.startDate === dateRange.endDate
                  ? moment(dateRange.startDate).format('DD MMM, YYYY')
                  : `${moment(dateRange.startDate).format('DD MMM')} - ${moment(dateRange.endDate).format('DD MMM, YYYY')}`}
              </Tag>
            )}
          </div>
        }
        className="mb-6"
        extra={
          <Button className="mr-4 !bg-blue-500 !text-white hover:!bg-blue-600" onClick={loadDashboardData}>
            Refresh Data
          </Button>
        }
      >
        {dashboardData.quantityUpdates && dashboardData.quantityUpdates.length > 0 ? (
          <Table
            dataSource={dashboardData.quantityUpdates}
            columns={quantityUpdateColumns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            bordered
            size="middle"
          />
        ) : (
          <div className="text-center p-10">
            <p>No quantity updates found for the selected period.</p>
            {timeFilter !== 'today' && (
              <Button className="bg-blue-500 mt-4" type="primary" onClick={() => setTimeFilter('today')}>
                View Today's Updates
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Rejection Reason Modal */}
      <Modal
        title="Enter Rejection Reason"
        open={rejectModalVisible}
        onOk={submitReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Reject Order"
        cancelText="Cancel"
        okButtonProps={{
          style: { backgroundColor: '#f5222d', borderColor: '#f5222d', color: '#fff' }
        }}
        cancelButtonProps={{
          style: { color: '#000' }
        }}
      >
        <div className="p-4">
          <p className="mb-2">Please provide a reason for rejecting this order:</p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;