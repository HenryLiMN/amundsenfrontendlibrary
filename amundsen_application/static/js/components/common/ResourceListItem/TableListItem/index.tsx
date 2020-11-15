// Copyright Contributors to the Amundsen project.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import * as Avatar from 'react-avatar';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import Collapsible from 'react-collapsible';

import { ResourceType, TableResource, TagType } from 'interfaces';

import BookmarkIcon from 'components/common/Bookmark/BookmarkIcon';

import { getSourceDisplayName, getSourceIconClass } from 'config/config-utils';

import BadgeList from 'components/common/BadgeList';
import SchemaInfo from 'components/common/ResourceListItem/SchemaInfo';
import { UpIcon, DownIcon } from 'components/common/SVGIcons';
import { logClick } from 'ducks/utilMethods';
import TagInfo from 'components/common/Tags/TagInfo';
import { LoggingParams } from '../types';

export interface TableListItemProps {
  table: TableResource;
  logging: LoggingParams;
}

class TableListItem extends React.Component<TableListItemProps, {}> {
  getLink = () => {
    const { table, logging } = this.props;

    return (
      `/table_detail/${table.cluster}/${table.database}/${table.schema}/${table.name}` +
      `?index=${logging.index}&source=${logging.source}`
    );
  };

  generateResourceIconClass = (
    databaseId: string,
    resource: ResourceType
  ): string => {
    return `icon resource-icon ${getSourceIconClass(databaseId, resource)}`;
  };

  render() {
    const { table } = this.props;
    const DUMMY_EMAIL1 = 'henry@sieve.data';
    const DUMMY_TARGET1 = '_blank';
    const DUMMY_DISPLAY_NAME1 = 'Henry Li';
    const DUMMY_EMAIL2 = 'carl@sieve.data';
    const DUMMY_TARGET2 = '_blank';
    const DUMMY_DISPLAY_NAME2 = 'Carl Fernandes';
    const DUMMY_TAGS = [
      {
        tag_count: 5,
        tag_name: 'PII',
        tag_type: TagType.TAG,
      },
      {
        tag_count: 1,
        tag_name: 'Core',
        tag_type: TagType.TAG,
      },
      {
        tag_count: 2,
        tag_name: 'Funnel',
        tag_type: TagType.TAG,
      },
    ];
    const tagBody = DUMMY_TAGS.map((tag, index) => (
      <TagInfo data={tag} key={index} />
    ));
    const DUMMY_COLS = [
      'user_id',
      'join_date',
      'first_name',
      'last_name',
      'city',
      'plan_tier',
      'device_type',
    ];
    const DUMMY_TABLE_HEADERS = DUMMY_COLS.map((colName, index) => (
      <th className="resource-summary-table-header-cell">{colName}</th>
    ));
    const DUMMY_DATA_TYPES = [
      'smallint(16)',
      'datetime',
      'varchar(20)',
      'varchar(20)',
      'varchar(40)',
      'binary',
      'varchar(20)',
    ];
    const DUMMY_DATA_TYPE_ROW = DUMMY_DATA_TYPES.map((dataType, index) => (
      <td className="resource-summary-table-cell">{dataType}</td>
    ));
    const DUMMY_RANGES = [
      '[234, 353]',
      '[03/15/15, 10/3/19]',
      'N/A',
      'N/A',
      'N/A',
      '[0, 1]',
      'N/A',
    ];
    const DUMMY_RANGE_ROW = DUMMY_RANGES.map((range, index) => (
      <td className="resource-summary-table-cell">{range}</td>
    ));
    const DUMMY_COUNTS = [
      '7871',
      '7871',
      '7871',
      '7871',
      '6578',
      '7871',
      '7536',
    ];
    const DUMMY_COUNT_ROW = DUMMY_COUNTS.map((count, index) => (
      <td className="resource-summary-table-cell">{count}</td>
    ));
    const COLLAPSIBLE_TRIGGER = (
      <section className="resource-collapsible-trigger">
        <DownIcon />
      </section>
    );
    const COLLAPSIBLE_TRIGGER_WHEN_OPEN = (
      <section className="resource-collapsible-trigger">
        <UpIcon />
      </section>
    );

    return (
      <li className="list-group-item clickable">
        <Link
          className="resource-list-item table-list-item"
          to={this.getLink()}
        >
          <div className="resource-info">
            <span
              className={this.generateResourceIconClass(
                table.database,
                table.type
              )}
            />
            <div className="resource-info-text my-auto">
              <div className="resource-name title-2">
                <div className="truncated">
                  {table.schema_description && (
                    <SchemaInfo
                      schema={table.schema}
                      table={table.name}
                      desc={table.schema_description}
                    />
                  )}
                  {!table.schema_description && `${table.schema}.${table.name}`}
                </div>
                <BookmarkIcon
                  bookmarkKey={table.key}
                  resourceType={table.type}
                />
              </div>
              <div className="body-secondary-3 truncated">
                {table.description}
              </div>
            </div>
          </div>
          <div className="resource-owner">
            <div className="resource-owner-label">Owned By</div>
            <div className="resource-owner-avatar">
              <OverlayTrigger
                key={DUMMY_EMAIL1}
                trigger={['hover', 'focus']}
                placement="top"
                overlay={
                  <Popover id="popover-trigger-hover-focus">
                    {DUMMY_EMAIL1}
                  </Popover>
                }
              >
                <Link
                  className="avatar-overlap"
                  onClick={logClick}
                  data-type="frequent-users"
                  to="/"
                  target={DUMMY_TARGET1}
                >
                  <Avatar
                    name={DUMMY_DISPLAY_NAME1}
                    round
                    size={25}
                    style={{ position: 'relative' }}
                  />
                </Link>
              </OverlayTrigger>
            </div>
            <div className="resource-owner-team">(Growth Team)</div>
          </div>
          <div className="resource-frequent-users">
            <div className="resource-frequent-users-label">Frequent Users</div>
            <div className="resource-frequent-users-avatars">
              <OverlayTrigger
                key={DUMMY_EMAIL2}
                trigger={['hover', 'focus']}
                placement="top"
                overlay={
                  <Popover id="popover-trigger-hover-focus">
                    {DUMMY_EMAIL2}
                  </Popover>
                }
              >
                <Link
                  className="avatar-overlap"
                  onClick={logClick}
                  data-type="frequent-users"
                  to="/"
                  target={DUMMY_TARGET2}
                >
                  <Avatar
                    name={DUMMY_DISPLAY_NAME2}
                    round
                    size={25}
                    style={{ position: 'relative' }}
                  />
                </Link>
              </OverlayTrigger>
              <OverlayTrigger
                key={DUMMY_EMAIL1}
                trigger={['hover', 'focus']}
                placement="top"
                overlay={
                  <Popover id="popover-trigger-hover-focus">
                    {DUMMY_EMAIL1}
                  </Popover>
                }
              >
                <Link
                  className="avatar-overlap"
                  onClick={logClick}
                  data-type="frequent-users"
                  to="/"
                  target={DUMMY_TARGET1}
                >
                  <Avatar
                    name={DUMMY_DISPLAY_NAME1}
                    round
                    size={25}
                    style={{ position: 'relative' }}
                  />
                </Link>
              </OverlayTrigger>
            </div>
          </div>
          <div className="resource-tags">
            <div className="resource-tags-label">Tags</div>
            <div className="resource-tags-tags">{tagBody}</div>
          </div>
        </Link>
        <Collapsible
          trigger={COLLAPSIBLE_TRIGGER}
          triggerWhenOpen={COLLAPSIBLE_TRIGGER_WHEN_OPEN}
        >
          <div className="resource-summary">
            <table className="resource-summary-table">
              <thead>
                <tr>
                  <th />
                  {DUMMY_TABLE_HEADERS}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="resource-summary-table-header-cell">
                    Data Type
                  </th>
                  {DUMMY_DATA_TYPE_ROW}
                </tr>
                <tr>
                  <th className="resource-summary-table-header-cell">Range</th>
                  {DUMMY_RANGE_ROW}
                </tr>
                <tr>
                  <th className="resource-summary-table-header-cell">Count</th>
                  {DUMMY_COUNT_ROW}
                </tr>
              </tbody>
            </table>
          </div>
        </Collapsible>
      </li>
    );
  }
}

export default TableListItem;
