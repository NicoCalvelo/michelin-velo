"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import Spinner from "../Components/Spinner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// Types définissant la structure des données et colonnes
export interface DataTableColumn<T = unknown> {
  title: string;
  value?: (row: T, index: number) => unknown;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  onSort?: (direction: "asc" | "desc") => void;
  width?: string | number;
  style?: React.CSSProperties;
  rotateTitle?: boolean;
  ariaDescribedBy?: string;
}

export interface DataTableCustomStyles {
  table?: string;
  thead?: string;
  tbody?: string;
  tfoot?: string;
  th?: string;
  td?: string;
  tr?: string;
}

export interface DataTableProps<T = unknown> {
  // Données et colonnes
  data?: T[];
  columns: DataTableColumn<T>[];

  // Configuration d'affichage
  numeration?: boolean;
  striped?: boolean;
  className?: string;
  customStyles?: DataTableCustomStyles;

  // Pagination
  pagination?: boolean;
  rowsCount?: number;
  rowsPerPage?: number;
  onChangePage?: (page: number) => void;

  // États
  loading?: boolean;
  error?: string | Error | null;

  // Footer
  showFooter?: boolean;
  noDataMessage?: string;

  // Accessibilité
  ariaLabel?: string;
  ariaDescription?: string;
  keyboardNavigation?: boolean;
  stickyHeader?: boolean;

  // Callbacks
  onClickRow?: (row: T) => void;
}

interface SortConfig<T = unknown> {
  title?: string;
  value?: (row: T, index: number) => unknown;
  direction?: "asc" | "desc";
}

interface TableConfig<T = unknown> {
  sort: SortConfig<T>;
  page: number;
}

export default function DataTable<T = unknown>({
  numeration = true,
  data,
  columns,
  striped = true,
  onClickRow,
  customStyles,
  pagination = false,
  rowsCount,
  rowsPerPage = 50,
  onChangePage,
  showFooter = true,
  noDataMessage = "Aucune donnée",
  className = "",
  loading = false,
  error = null,
  ariaLabel = "Tableau de données",
  ariaDescription,
  keyboardNavigation = true,
  stickyHeader = false,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [config, setConfig] = useState<TableConfig<T>>({
    sort: {
      title: undefined,
      value: undefined,
      direction: undefined,
    },
    page: searchParams ? parseInt(searchParams.get("page") || "1") : 1,
  });

  // Validation des données
  const validatedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((row) => row != null);
  }, [data]);

  const totalPages = useMemo(() => {
    if (!pagination || !rowsCount || !rowsPerPage) return 1;
    return Math.ceil(rowsCount / rowsPerPage);
  }, [pagination, rowsCount, rowsPerPage]);

  // Validation des colonnes
  const validatedColumns = useMemo(() => {
    if (!Array.isArray(columns)) {
      console.error("DataTable: columns prop must be an array");
      return [];
    }
    return columns.filter((column) => {
      if (!column.title || (!column.value && !column.cell)) {
        console.error("DataTable: Each column must have a title and either value or cell function");
        return false;
      }
      return true;
    });
  }, [columns]);

  // Gestion d'erreur pour les props requises
  useEffect(() => {
    if (pagination && !rowsCount) {
      console.warn("DataTable: rowsCount is required when pagination is enabled");
    }
    if (validatedColumns.length === 0) {
      console.error("DataTable: No valid columns provided");
    }
  }, [pagination, rowsCount, validatedColumns]);

  const handleSort = useCallback(
    (column: DataTableColumn<T>) => {
      if (!column.sortable) return;

      let direction: "asc" | "desc" = "asc";
      if (config.sort.title === column.title) {
        direction = config.sort.direction === "asc" ? "desc" : "asc";
      }

      setConfig((prev) => ({
        ...prev,
        sort: {
          title: column.title,
          value: column.value,
          direction,
        },
      }));

      if (column.onSort) {
        try {
          column.onSort(direction);
        } catch (error) {
          console.error("DataTable: Error in column onSort callback:", error);
        }
      }
    },
    [config.sort.title, config.sort.direction]
  );

  const handleSetPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;

      setConfig((prev) => ({
        ...prev,
        page,
      }));

      if (onChangePage) {
        try {
          onChangePage(page);
        } catch (error) {
          console.error("DataTable: Error in onChangePage callback:", error);
        }
      }

      // Update search params with Next.js router
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [totalPages, onChangePage, searchParams, pathname, router]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, row: T, rowIndex: number) => {
      if (!keyboardNavigation) return;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (onClickRow) {
            try {
              onClickRow(row);
            } catch (error) {
              console.error("DataTable: Error in onClickRow callback:", error);
            }
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedRowIndex(Math.min(rowIndex + 1, validatedData.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedRowIndex(Math.max(rowIndex - 1, 0));
          break;
      }
    },
    [keyboardNavigation, onClickRow, validatedData.length]
  );

  const handleHeaderKeyDown = useCallback(
    (event: React.KeyboardEvent, column: DataTableColumn<T>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSort(column);
      }
    },
    [handleSort]
  );

  const sortedData = useMemo(() => {
    if (!config.sort.value || !validatedData.length) return validatedData;

    return [...validatedData].sort((a, b) => {
      try {
        const valueA = config.sort.value!(a, 0);
        const valueB = config.sort.value!(b, 0);

        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return config.sort.direction === "asc" ? 1 : -1;
        if (valueB == null) return config.sort.direction === "asc" ? -1 : 1;

        if (config.sort.direction === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      } catch (error) {
        console.error("DataTable: Error in sorting function:", error);
        return 0;
      }
    });
  }, [validatedData, config.sort]);

  // Affichage des erreurs
  if (error) {
    return (
      <div
        className={
          "flex flex-col focus:border-none pb-2 justify-center items-center relative overflow-x-auto sm:rounded-xl bg-white space-y-2 p-10 " + className
        }
      >
        <div className="text-red-500 text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-sm text-gray-600">
            {typeof error === "string" ? error : error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des données"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={"flex flex-col focus:border-none pb-2 justify-between relative overflow-x-auto sm:rounded-xl space-y-2 " + className}
      role="region"
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? "table-description" : undefined}
    >
      {ariaDescription && (
        <div id="table-description" className="sr-only">
          {ariaDescription}
        </div>
      )}
      <table
        className={
          "w-full text-sm text-left rtl:text-right bg-white rounded-lg shadow-md overflow-hidden text-gray-500 " +
          (customStyles?.table || "") +
          (validatedData?.length === 0 ? " table-fixed!" : "")
        }
        role="table"
        aria-label={ariaLabel}
        aria-rowcount={validatedData?.length || 0}
        aria-colcount={validatedColumns.length + (numeration ? 1 : 0)}
      >
        <thead
          className={
            "text-xs text-gray-700 bg-white " + (customStyles?.thead || "") + (stickyHeader ? " sticky top-0 z-10" : "")
          }
        >
          <tr role="row">
            {numeration && (
              <th className={"py-2 px-3 " + (customStyles?.th || "")} scope="col" aria-label="Numéro de ligne">
                #
              </th>
            )}
            {validatedColumns.map((column, index) => (
              <th
                key={column.title + index}
                className={
                  "group pb-1 px-2 sm:py-2 sm:px-3 truncate align-bottom " +
                  (customStyles?.th || "") +
                  (column.className ? " " + column.className : "") +
                  (column.rotateTitle ? " h-40 !w-8 !px-0 !pb-3" : "") +
                  (column.sortable ? " cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" : "")
                }
                onClick={() => handleSort(column)}
                onKeyDown={(e) => handleHeaderKeyDown(e, column)}
                style={{ width: column.width || "auto", ...column.style }}
                scope="col"
                tabIndex={column.sortable ? 0 : -1}
                role={column.sortable ? "columnheader button" : "columnheader"}
                aria-sort={
                  config.sort.title === column.title ? (config.sort.direction === "asc" ? "ascending" : "descending") : column.sortable ? "none" : undefined
                }
                aria-label={
                  column.sortable
                    ? `${column.title}, ${
                        config.sort.title === column.title
                          ? `trié par ${config.sort.direction === "asc" ? "ordre croissant" : "ordre décroissant"}`
                          : "non trié"
                      }, cliquez pour trier`
                    : column.title
                }
              >
                <div className={"flex items-center space-x-2 " + (column.rotateTitle ? "transform -rotate-90 w-8" : "")}>
                  <p className="flex-grow">{column.title}</p>
                  {column.sortable && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={
                        "w-5 h-5 transition-opacity " +
                        (config.sort.title === column.title ? "opacity-100" : "opacity-0 group-hover:opacity-75 hover:!opacity-100")
                      }
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={customStyles?.tbody || ""}>
          {(loading || !data) && (
            <tr>
              <td colSpan={validatedColumns.length + (numeration ? 1 : 0)} className="text-center p-10 bg-gray-50" role="cell">
                <div className="flex flex-col space-y-2 items-center justify-center">
                  <Spinner />
                  <p aria-live="polite">Chargement...</p>
                </div>
              </td>
            </tr>
          )}
          {data && validatedData.length === 0 && !loading && (
            <tr>
              <td colSpan={validatedColumns.length + (numeration ? 1 : 0)} className="text-center p-10 bg-gray-50" role="cell">
                <div aria-live="polite">{noDataMessage}</div>
              </td>
            </tr>
          )}
          {sortedData.map((row, index) => {
            // Safely get ID for key generation
            const getRowId = (row: T): string => {
              if (row && typeof row === "object" && "id" in row) {
                return String((row as { id: unknown }).id);
              }
              return `row-${index}`;
            };

            const rowId = getRowId(row);

            return (
              <tr
                key={rowId}
                id={"row-" + rowId}
                onClick={
                  onClickRow
                    ? () => {
                        try {
                          onClickRow(row);
                        } catch (error) {
                          console.error("DataTable: Error in onClickRow callback:", error);
                        }
                      }
                    : undefined
                }
                onKeyDown={(e) => handleKeyDown(e, row, index)}
                className={
                  "border-b last:border-b-0 group " +
                  (customStyles?.tr || "") +
                  (striped ? " odd:bg-gray-50" : "") +
                  (onClickRow ? " hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500" : "") +
                  (focusedRowIndex === index ? " ring-2 ring-blue-500" : "")
                }
                role="row"
                tabIndex={onClickRow && keyboardNavigation ? 0 : -1}
                aria-rowindex={index + 1}
                aria-selected={focusedRowIndex === index}
              >
                {numeration && (
                  <td className={"pl-2 sm:pl-3 " + (customStyles?.td || "")} role="cell" aria-label={`Ligne ${index + 1 + (config.page - 1) * rowsPerPage}`}>
                    {index + 1 + (config.page - 1) * rowsPerPage}
                  </td>
                )}
                {validatedColumns.map((column, i) => (
                  <td
                    key={i}
                    className={"pl-2 sm:pl-3 relative " + (customStyles?.td || "") + (column.className ? " " + column.className : "")}
                    role="cell"
                    aria-describedby={column.ariaDescribedBy}
                  >
                    {(() => {
                      try {
                        if (column.cell) {
                          return column.cell(row, index);
                        } else if (column.value) {
                          const value = column.value(row, index);
                          // Convert unknown value to React.ReactNode
                          if (value === null || value === undefined) {
                            return null;
                          }
                          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                            return value;
                          }
                          if (React.isValidElement(value)) {
                            return value;
                          }
                          return String(value);
                        }
                        return null;
                      } catch (error) {
                        console.error(`DataTable: Error rendering column "${column.title}":`, error);
                        return <span className="text-red-500 text-xs">Erreur</span>;
                      }
                    })()}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {showFooter && (
        <div
          className={
            "sticky left-0 flex flex-row justify-between items-center w-full py-2 sm:py-1 px-3 border-t border-gray-200 text-xs sm:text-sm gap-2 sm:gap-0 " +
            (customStyles?.tfoot || "")
          }
          role="navigation"
          aria-label="Pagination du tableau"
        >
          <div className="flex space-x-2 items-center w-full sm:w-auto justify-center sm:justify-start">
            <label htmlFor="rows-per-page" className="sr-only">
              Nombre d&apos;éléments par page
            </label>
            <select
              id="rows-per-page"
              className="border border-gray-100 rounded-md p-1 text-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rowsPerPage}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                handleSetPage(1);
                localStorage.setItem("limit", newValue.toString());

                // Update search params with Next.js router
                const params = new URLSearchParams(searchParams?.toString());
                params.set("limit", newValue.toString());
                router.push(`${pathname}?${params.toString()}`);
              }}
              aria-label="Nombre d'éléments par page"
            >
              {[5, 15, 25, 50, 100].map((value) => {
                const isSelected = rowsPerPage === value;
                return (
                  <option key={value} value={value}>
                    {isSelected && validatedData?.length < value ? validatedData?.length : value}
                  </option>
                );
              })}
            </select>
            <p aria-live="polite" className="hidden sm:inline">
              éléments affichés
            </p>
            <p aria-live="polite" className="sm:hidden">
              éléments
            </p>
          </div>
          {pagination && (
            <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-5 text-xs sm:text-sm w-full sm:w-auto" role="group" aria-label="Navigation des pages">
              <button
                className={
                  "px-2 sm:pr-4 sm:pl-2 py-1 flex items-center space-x-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 " +
                  (config.page === 1 ? "opacity-50 cursor-not-allowed" : "hover:underline hover:bg-gray-50")
                }
                onClick={() => handleSetPage(config.page - 1)}
                disabled={config.page === 1}
                aria-label="Page précédente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Précédent</span>
              </button>
              {rowsCount && rowsPerPage && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="hidden sm:inline">page</span>
                  <label htmlFor="page-select" className="sr-only">
                    Sélectionner la page
                  </label>
                  <select
                    id="page-select"
                    className="border border-gray-100 rounded-md p-1 text-center text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={config.page}
                    onChange={(e) => handleSetPage(parseInt(e.target.value))}
                    aria-label={`Page ${config.page} sur ${totalPages}`}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <option key={page} value={page}>
                        {page}
                      </option>
                    ))}
                  </select>
                  <span aria-live="polite">/ {totalPages}</span>
                </div>
              )}
              <button
                className={
                  "px-2 sm:pr-2 sm:pl-4 py-1 flex items-center space-x-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 " +
                  (config.page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:underline hover:bg-gray-50")
                }
                onClick={() => handleSetPage(config.page + 1)}
                disabled={config.page >= totalPages}
                aria-label="Page suivante"
              >
                <span className="hidden sm:inline">Suivant</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
