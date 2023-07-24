import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import get from "lodash.get";

export interface IColumnType<T> {
  key: string;
  title: string;
  width?: number | string;
  align?: string;
  render?: (column: IColumnType<T>, item: T) => void;
}

interface Props<T> {
  data: T[];
  columns: IColumnType<T>[];
  draggable?: boolean;
  onDragEnd?: ({ id, newIndex }: { id: string; newIndex: number }) => void;
}

interface RowProps<T> {
  data: T[];
  columns: IColumnType<T>[];
}

interface CellProps<T> {
  item: T;
  column: IColumnType<T>;
}

interface HeaderProps<T> {
  columns: IColumnType<T>[];
}

export function Table<T>({
  data,
  columns,
  draggable,
  onDragEnd
}: Props<T>): JSX.Element {
  const handleDragEnd = (result: any) => {
    if (!result?.destination) {
      return;
    }
    if (result?.source?.index === result?.destination?.index) {
      return;
    }
    const updatedData = Array.from(data);
    const [reorderedItem] = updatedData.splice(result.source.index, 1);
    updatedData.splice(result.destination.index, 0, reorderedItem);
    data = updatedData;
    if (onDragEnd) {
      onDragEnd({ id: result.draggableId, newIndex: result.destination.index });
    }
  };

  function TableRowCell<T>({ item, column }: CellProps<T>): JSX.Element {
    const value = get(item, column.key);
    return (
      <td
        className={`px-3 py-4 text-sm text-gray-500 ${
          column.align === "center" ? "text-center" : ""
        }`}
        style={{ width: column.width }}
      >
        {column.render ? column.render(column, item) : value}
      </td>
    );
  }

  function TableRow<T>({ data, columns }: RowProps<T>): JSX.Element {
    return (
      <>
        {data.map((item: any, itemIndex) => (
          <Draggable
            key={item.id}
            draggableId={item.id}
            index={itemIndex}
            isDragDisabled={!draggable}
          >
            {(provided, snapshot) => (
              <tr
                ref={provided.innerRef}
                {...provided.draggableProps}
                key={`table-body-${itemIndex}`}
                className={`${
                  snapshot.isDragging
                    ? "bg-white opacity-100 shadow-md flex"
                    : ""
                }`}
              >
                {draggable && (
                  <td width={"3%"} className="py-4 text-gray-500 ">
                    <div
                      className="grab flex justify-center p-1"
                      {...provided.dragHandleProps}
                    >
                      <svg
                        width="13"
                        height="5"
                        viewBox="0 0 13 5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.957947 1.18988L12.7056 1.18988M0.957947 3.99956H12.7056"
                          stroke="black"
                          strokeOpacity="0.8"
                          strokeWidth="0.932269"
                        />
                      </svg>
                    </div>
                  </td>
                )}

                {columns.map((column, columnIndex) => (
                  <TableRowCell
                    key={`table-row-cell-${columnIndex}`}
                    item={item}
                    column={column}
                  />
                ))}
              </tr>
            )}
          </Draggable>
        ))}
      </>
    );
  }

  function TableHeader<T>({ columns }: HeaderProps<T>): JSX.Element {
    return (
      <tr>
        {draggable && <th></th>}
        {columns.map((column, columnIndex) => (
          <th
            key={`table-head-cell-${columnIndex}`}
            style={{ width: column.width }}
            scope="col"
            className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 align-baseline ${
              column.align === "center" ? "text-center" : ""
            }`}
          >
            {column.title}
          </th>
        ))}
      </tr>
    );
  }
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="sticky top-0 bg-white" style={{ zIndex: "2" }}>
          <TableHeader columns={columns} />
        </thead>
        <Droppable droppableId="tablethien">
          {provided => (
            <tbody
              className="divide-y divide-gray-200 relative"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <TableRow data={data} columns={columns} />
              {provided.placeholder}
            </tbody>
          )}
        </Droppable>
      </table>
    </DragDropContext>
  );
}
