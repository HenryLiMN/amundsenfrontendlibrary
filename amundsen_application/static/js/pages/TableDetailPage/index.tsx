// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import * as Avatar from 'react-avatar';
import * as DocumentTitle from 'react-document-title';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps } from 'react-router';
import ReactQuill from 'react-quill';
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
  Button,
  Table,
} from 'reactstrap';
import classnames from 'classnames';
import moment from 'moment';
import { Comment } from 'antd';

import { GlobalState } from 'ducks/rootReducer';
import { getTableData } from 'ducks/tableMetadata/reducer';
import { openRequestDescriptionDialog } from 'ducks/notification/reducer';
import { GetTableDataRequest } from 'ducks/tableMetadata/types';
import { OpenRequestAction } from 'ducks/notification/types';

import {
  getDescriptionSourceDisplayName,
  getMaxLength,
  getSourceIconClass,
  getTableSortCriterias,
  indexDashboardsEnabled,
  issueTrackingEnabled,
  notificationsEnabled,
} from 'config/config-utils';

import BadgeList from 'components/common/BadgeList';
import BookmarkIcon from 'components/common/Bookmark/BookmarkIcon';
import Breadcrumb from 'components/common/Breadcrumb';
import TabsComponent, { TabInfo } from 'components/common/TabsComponent';
import TagInput from 'components/common/Tags/TagInput';
import EditableText from 'components/common/EditableText';
import LoadingSpinner from 'components/common/LoadingSpinner';
import EditableSection from 'components/common/EditableSection';
import ColumnList from 'components/ColumnList';

import { formatDate, formatDateTimeShort } from 'utils/dateUtils';
import { getLoggingParams } from 'utils/logUtils';

import {
  ProgrammaticDescription,
  ResourceType,
  TableMetadata,
  RequestMetadataType,
  SortCriteria,
  Watermark,
} from 'interfaces';

import DataPreviewButton from './DataPreviewButton';
import ExploreButton from './ExploreButton';
import FrequentUsers from './FrequentUsers';
import LineageLink from './LineageLink';
import TableOwnerEditor from './TableOwnerEditor';
import SourceLink from './SourceLink';
import TableDashboardResourceList from './TableDashboardResourceList';
import TableDescEditableText from './TableDescEditableText';
import TableHeaderBullets from './TableHeaderBullets';
import TableIssues from './TableIssues';
import WatermarkLabel from './WatermarkLabel';
import WriterLink from './WriterLink';
import TableReportsDropdown from './ResourceReportsDropdown';
import RequestDescriptionText from './RequestDescriptionText';
import RequestMetadataForm from './RequestMetadataForm';
import ListSortingDropdown from './ListSortingDropdown';
import {
  WATERMARK_INPUT_FORMAT,
  WatermarkType,
} from './WatermarkLabel/constants';

import * as Constants from './constants';

import './styles.scss';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.snow.css';
import 'antd/dist/antd.css';

const SERVER_ERROR_CODE = 500;
const DASHBOARDS_PER_PAGE = 10;
const TABLE_SOURCE = 'table_page';
const SORT_CRITERIAS = {
  ...getTableSortCriterias(),
};
const OVERVIEW_TAB_KEY = 'overview';
const COLUMN_TAB_KEY = 'columns';

const HENRY_AVATAR = (
  <Avatar name="Henry Li" round size={25} style={{ position: 'relative' }} />
);
const CARL_AVATAR = (
  <Avatar
    name="Carl Fernandes"
    round
    size={25}
    style={{ position: 'relative' }}
  />
);

export interface PropsFromState {
  isLoading: boolean;
  isLoadingDashboards: boolean;
  numRelatedDashboards: number;
  statusCode: number | null;
  tableData: TableMetadata;
}
export interface DispatchFromProps {
  getTableData: (
    key: string,
    searchIndex?: string,
    source?: string
  ) => GetTableDataRequest;
  openRequestDescriptionDialog: (
    requestMetadataType: RequestMetadataType,
    columnName: string
  ) => OpenRequestAction;
}

export interface MatchProps {
  cluster: string;
  database: string;
  schema: string;
  table: string;
}

export type TableDetailProps = PropsFromState &
  DispatchFromProps &
  RouteComponentProps<MatchProps>;

const ErrorMessage = () => {
  return (
    <div className="container error-label">
      <Breadcrumb />
      <label>{Constants.ERROR_MESSAGE}</label>
    </div>
  );
};

export interface StateProps {
  sortedBy: SortCriteria;
  // currentTab: string;
  activeTab: string;
  overviewCommentValue: string;
  selectedColumn: number;
}

export class TableDetail extends React.Component<
  TableDetailProps & RouteComponentProps<any>,
  StateProps
> {
  private key: string;

  private didComponentMount: boolean = false;

  state = {
    sortedBy: SORT_CRITERIAS.sort_order,
    // currentTab: COLUMN_TAB_KEY,
    activeTab: OVERVIEW_TAB_KEY,
    overviewCommentValue: '',
    selectedColumn: 0,
  };

  componentDidMount() {
    const { location, getTableData } = this.props;
    const { index, source } = getLoggingParams(location.search);

    this.key = this.getTableKey();
    getTableData(this.key, index, source);
    this.didComponentMount = true;
  }

  componentDidUpdate() {
    const { location, getTableData } = this.props;
    const newKey = this.getTableKey();

    if (this.key !== newKey) {
      const { index, source } = getLoggingParams(location.search);

      this.key = newKey;
      getTableData(this.key, index, source);
    }
  }

  getDisplayName() {
    const { match } = this.props;
    const { params } = match;

    return `${params.schema}.${params.table}`;
  }

  getTableKey() {
    /*
    This 'key' is the `table_uri` format described in metadataservice. Because it contains the '/' character,
    we can't pass it as a single URL parameter without encodeURIComponent which makes ugly URLs.
    DO NOT CHANGE
    */
    const { match } = this.props;
    const { params } = match;

    return `${params.database}://${params.cluster}.${params.schema}/${params.table}`;
  }

  getWatermarkDateRange() {
    const lowWatermark = this.props.tableData.watermarks.find(
      (watermark: Watermark) => watermark.watermark_type === WatermarkType.LOW
    );
    const low = (lowWatermark && lowWatermark.partition_value) || null;
    const startDate = low
      ? formatDate({
          dateString: low,
          dateStringFormat: WATERMARK_INPUT_FORMAT,
        })
      : 'Unknown Start Date';

    const highWatermark = this.props.tableData.watermarks.find(
      (watermark: Watermark) => watermark.watermark_type === WatermarkType.HIGH
    );
    const high = (highWatermark && highWatermark.partition_value) || null;
    const endDate = high
      ? formatDate({
          dateString: high,
          dateStringFormat: WATERMARK_INPUT_FORMAT,
        })
      : 'Unknown End Date';

    return startDate + ' - ' + endDate;
  }

  handleOverviewCommentValueChange(content, delta, source, editor) {
    this.setState({
      overviewCommentValue: editor.getHTML(),
    });
  }

  renderProgrammaticDesc = (
    descriptions: ProgrammaticDescription[] | undefined
  ) => {
    if (!descriptions) {
      return null;
    }

    return descriptions.map((d) => (
      <EditableSection key={`prog_desc:${d.source}`} title={d.source} readOnly>
        <EditableText maxLength={999999} value={d.text} editable={false} />
      </EditableSection>
    ));
  };

  handleSortingChange = (sortValue) => {
    this.toggleSort(SORT_CRITERIAS[sortValue]);
  };

  toggleSort = (sorting: SortCriteria) => {
    const { sortedBy } = this.state;

    if (sorting !== sortedBy) {
      this.setState({
        sortedBy: sorting,
      });
    }
  };

  toggleTab = (tab) => {
    if (this.state.activeTab !== tab) this.setState({ activeTab: tab });
  };

  selectColumn = (tab) => {
    if (this.state.selectedColumn !== tab) {
      this.setState({ selectedColumn: tab });
    }
  };

  renderTabs(editText, editUrl) {
    const tabInfo: TabInfo[] = [];
    const {
      isLoadingDashboards,
      numRelatedDashboards,
      tableData,
      openRequestDescriptionDialog,
    } = this.props;
    const { sortedBy } = this.state;

    // Default Column content
    tabInfo.push({
      content: (
        <ColumnList
          openRequestDescriptionDialog={openRequestDescriptionDialog}
          columns={tableData.columns}
          database={tableData.database}
          editText={editText}
          editUrl={editUrl}
          sortBy={sortedBy}
        />
      ),
      key: 'columns',
      title: `Columns (${tableData.columns.length})`,
    });

    if (indexDashboardsEnabled()) {
      const loadingTitle = (
        <div className="tab-title">
          Dashboards <LoadingSpinner />
        </div>
      );

      tabInfo.push({
        content: (
          <TableDashboardResourceList
            itemsPerPage={DASHBOARDS_PER_PAGE}
            source={TABLE_SOURCE}
          />
        ),
        key: 'dashboards',
        title: isLoadingDashboards
          ? loadingTitle
          : `Dashboards (${numRelatedDashboards})`,
      });
    }

    return (
      <TabsComponent
        tabs={tabInfo}
        defaultTab="columns"
        onSelect={(key) => {
          // this.setState({ currentTab: key });
        }}
      />
    );
  }

  render() {
    const {
      isLoading,
      statusCode,
      tableData,
      openRequestDescriptionDialog,
    } = this.props;
    const {
      activeTab,
      sortedBy,
      overviewCommentValue,
      selectedColumn,
    } = this.state;
    let innerContent;

    // We want to avoid rendering the previous table's metadata before new data is fetched in componentDidMount
    if (isLoading || !this.didComponentMount) {
      innerContent = <LoadingSpinner />;
    } else if (statusCode === SERVER_ERROR_CODE) {
      innerContent = <ErrorMessage />;
    } else {
      const data = tableData;
      const editText = data.source
        ? `${Constants.EDIT_DESC_TEXT} ${getDescriptionSourceDisplayName(
            data.source.source_type
          )}`
        : '';
      const editUrl = data.source ? data.source.source : '';
      const dateRange = this.getWatermarkDateRange();

      innerContent = (
        <div className="resource-detail-layout table-detail">
          {notificationsEnabled() && <RequestMetadataForm />}
          <header className="resource-header">
            <div className="header-section">
              <Breadcrumb />
              <span
                className={
                  'icon icon-header ' +
                  getSourceIconClass(data.database, ResourceType.table)
                }
              />
            </div>
            <div className="header-section header-title">
              <div className="header-top-row">
                <h1 className="header-title-text truncated">
                  {this.getDisplayName()}
                </h1>
                <BookmarkIcon
                  bookmarkKey={data.key}
                  resourceType={ResourceType.table}
                />
                {!!data.last_updated_timestamp && (
                  <div className="header-last-updated">
                    {'(' + Constants.LAST_UPDATED_TITLE + ': '}
                    <time className="body-3">
                      {formatDateTimeShort({
                        epochTimestamp: data.last_updated_timestamp,
                      })}
                      )
                    </time>
                  </div>
                )}
              </div>
              <div className="body-3 header-bullets">
                <TableHeaderBullets
                  database={data.database}
                  cluster={data.cluster}
                  isView={data.is_view}
                />
                {data.badges.length > 0 && <BadgeList badges={data.badges} />}
              </div>
              {!data.is_view && (
                <section className="body-3 resource-details-date-range">
                  {dateRange}
                </section>
              )}
            </div>
            <div className="header-section header-links">
              <WriterLink tableWriter={data.table_writer} />
              <LineageLink tableData={data} />
              <SourceLink tableSource={data.source} />
            </div>
            <div className="header-section header-buttons">
              <TableReportsDropdown resourceReports={data.resource_reports} />
              <DataPreviewButton modalTitle={this.getDisplayName()} />
              <ExploreButton tableData={data} />
            </div>
          </header>
          <div className="column-layout-1 table-detail-body">
            <Nav pills vertical>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: activeTab === OVERVIEW_TAB_KEY,
                  })}
                  onClick={() => {
                    this.toggleTab(OVERVIEW_TAB_KEY);
                  }}
                >
                  Overview
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({
                    active: activeTab === COLUMN_TAB_KEY,
                  })}
                  onClick={() => {
                    this.toggleTab(COLUMN_TAB_KEY);
                  }}
                >
                  Columns
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId={OVERVIEW_TAB_KEY}>
                <Row>
                  <Col sm="3" className="resource-detail-overview-left-col">
                    <section className="resource-detail-owners-users">
                      <EditableSection title={Constants.OWNERS_TITLE}>
                        <TableOwnerEditor resourceType={ResourceType.table} />
                      </EditableSection>
                      <section className="resource-frequent-users">
                        <div className="section-title">
                          {Constants.FREQ_USERS_TITLE}
                        </div>
                        <FrequentUsers readers={data.table_readers} />
                      </section>
                    </section>
                    <section className="resource-detail-tags">
                      <EditableSection title={Constants.TAG_TITLE}>
                        <TagInput
                          resourceType={ResourceType.table}
                          uriKey={tableData.key}
                        />
                      </EditableSection>
                    </section>
                  </Col>
                  <Col sm="8" className="resource-detail-overview-right-col">
                    <section className="resource-detail-overview-info">
                      <EditableSection
                        title={Constants.DESCRIPTION_TITLE}
                        readOnly={!data.is_editable}
                        editText={editText}
                        editUrl={editUrl || undefined}
                      >
                        <TableDescEditableText
                          maxLength={getMaxLength('tableDescLength')}
                          value={data.description}
                          editable={data.is_editable}
                        />
                        <span>
                          {notificationsEnabled() && <RequestDescriptionText />}
                        </span>
                      </EditableSection>
                      {issueTrackingEnabled() && (
                        <section className="metadata-section">
                          <TableIssues
                            tableKey={this.key}
                            tableName={this.getDisplayName()}
                          />
                        </section>
                      )}
                    </section>
                    <section className="create-comment-wrapper">
                      <div className="section-title">Discussion</div>
                      <div className="comment-editor-box">
                        <ReactQuill
                          theme="snow"
                          value={overviewCommentValue}
                          onChange={this.handleOverviewCommentValueChange}
                        />
                      </div>
                      <div className="comment-btn-wrapper">
                        <Button color="success" className="comment-btn">
                          Comment
                        </Button>
                      </div>
                      <Comment
                        actions={[
                          <span key="comment-nested-reply-to">Reply</span>,
                        ]}
                        author={<a href=".">Henry Li</a>}
                        avatar={HENRY_AVATAR}
                        content={
                          <p>
                            {'I’ve added descriptions to all columns in the ' +
                              'Columns tab. Feel free to reply to this thread ' +
                              'if you have general questions or comments. ' +
                              'Please let me know asap if you find any errors.'}
                          </p>
                        }
                        datetime={moment('20201115', 'YYYYMMDD').fromNow()}
                      />
                    </section>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId={COLUMN_TAB_KEY}>
                <Row>
                  <Col sm="11">
                    {/* <ListSortingDropdown */}
                    {/*  options={SORT_CRITERIAS}*/}
                    {/*  onChange={this.handleSortingChange}*/}
                    {/* /> */}
                    <div className="resource-detail-columns-view">
                      <div className="column-table-wrapper">
                        <Table hover className="column-table">
                          <thead>
                            <tr>
                              <th>Column</th>
                              <th>Data Type</th>
                              <th>Range</th>
                              <th>Mean</th>
                              <th>Count</th>
                              <th>Null</th>
                              <th>Description</th>
                              <th>Comments</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.columns.map((value, index) => {
                              return (
                                <tr
                                  className={
                                    selectedColumn === index
                                      ? 'selected-col'
                                      : ''
                                  }
                                  onClick={() => this.selectColumn(index)}
                                >
                                  <td className="column-name-cell">
                                    {value.name}
                                  </td>
                                  <td>{value.col_type}</td>
                                  <td>range stat</td>
                                  <td>mean stat</td>
                                  <td>count stat</td>
                                  <td>null count stat</td>
                                  <td>{value.description}</td>
                                  <td>comments</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <TabContent activeTab={selectedColumn}>
                        {/* TODO: put ReactQuill outside of the various possible
                        comment threads on its own OR make a new component for
                        comment editing that includes ReactQuill for each
                        column */}
                        {tableData.columns.map((value, index) => {
                          return (
                            <TabPane tabId={index}>
                              <section className="create-comment-wrapper">
                                <div className="section-title">
                                  <div className="discussion-label">
                                    Discussion
                                  </div>
                                  <div className="table-col-label">
                                    {tableData.name}.{value.name}
                                  </div>
                                </div>
                                <div className="comment-editor-box">
                                  <ReactQuill theme="snow" />
                                </div>
                                <div className="comment-btn-wrapper">
                                  <Button
                                    color="success"
                                    className="comment-btn"
                                  >
                                    Comment
                                  </Button>
                                </div>
                                <Comment
                                  actions={[
                                    <span key="comment-nested-reply-to">
                                      Reply
                                    </span>,
                                  ]}
                                  author={<a href=".">Carl Fernandes</a>}
                                  avatar={CARL_AVATAR}
                                  content={
                                    <p>
                                      {'Why are there null values in the city ' +
                                        'column?'}
                                    </p>
                                  }
                                  datetime={moment(
                                    '20191115',
                                    'YYYYMMDD'
                                  ).fromNow()}
                                >
                                  <Comment
                                    actions={[
                                      <span key="comment-nested-reply-to">
                                        Reply
                                      </span>,
                                    ]}
                                    author={<a href=".">Henry Li</a>}
                                    avatar={HENRY_AVATAR}
                                    content={
                                      <p>
                                        {"Our application flow didn't " +
                                          'contain a request for city prior ' +
                                          'to 2019, so we don t have data ' +
                                          'on earlier applicants.'}
                                      </p>
                                    }
                                    datetime={moment(
                                      '20191116',
                                      'YYYYMMDD'
                                    ).fromNow()}
                                  />
                                </Comment>
                              </section>
                            </TabPane>
                          );
                        })}
                      </TabContent>
                    </div>
                    {/* <ColumnList */}
                    {/*  openRequestDescriptionDialog={*/}
                    {/*    openRequestDescriptionDialog*/}
                    {/*  }*/}
                    {/*  columns={tableData.columns}*/}
                    {/*  database={tableData.database}*/}
                    {/*  editText={editText}*/}
                    {/*  editUrl={editUrl || undefined}*/}
                    {/*  sortBy={sortedBy}*/}
                    {/* /> */}
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </div>
        </div>
      );
    }

    return (
      <DocumentTitle
        title={`${this.getDisplayName()} - Amundsen Table Details`}
      >
        {innerContent}
      </DocumentTitle>
    );
  }
}

export const mapStateToProps = (state: GlobalState) => {
  return {
    isLoading: state.tableMetadata.isLoading,
    statusCode: state.tableMetadata.statusCode,
    tableData: state.tableMetadata.tableData,
    numRelatedDashboards: state.tableMetadata.dashboards
      ? state.tableMetadata.dashboards.dashboards.length
      : 0,
    isLoadingDashboards: state.tableMetadata.dashboards
      ? state.tableMetadata.dashboards.isLoading
      : true,
  };
};

export const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    { getTableData, openRequestDescriptionDialog },
    dispatch
  );
};

export default connect<PropsFromState, DispatchFromProps>(
  mapStateToProps,
  mapDispatchToProps
)(TableDetail);
